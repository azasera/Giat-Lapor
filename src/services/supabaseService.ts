import { createClient, Session } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabaseConfig';
import { ReportData, Activity, Achievement, DetailedEvaluationItem } from '../types/report'; // Update import
import { RABData, ExpenseItem, SourceOfFund, UnitType, WeekNumber } from '../types/rab'; // Import RAB types
import { RABRealization, RealizationItem } from '../types/realization'; // Import Realization types
import { MemoData } from '../types/memo';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized.');

// --- Helper Functions ---

/**
 * Check if an ID is a temporary client-side ID (starts with ACT-, ACH-, REP-, RUT-, or INC-)
 * @param id The ID to check
 * @returns true if it's a temporary ID
 */
const isTemporaryId = (id: string): boolean => {
  return id.startsWith('ACT-') || id.startsWith('ACH-') || id.startsWith('REP-') || id.startsWith('RUT-') || id.startsWith('INC-') || id.startsWith('temp-');
};

// --- Supabase Service Functions ---

/**
 * Fetches the user's profile, including their role.
 * @param userId The ID of the user.
 * @returns The user's profile data or null if not found.
 */
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, username, full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    // If no row is found, .single() will return an an error, which is expected for new users
    if (error.code === 'PGRST116') { // Specific error code for 'no rows found'
      console.log(`No profile found for user ${userId}.`);
      return null;
    }
    console.error('Error fetching user profile:', error.message, error.details, error.hint);
    throw error; // Re-throw other errors
  }
  return data;
};

/**
 * Creates a new profile entry for a newly registered user.
 * @param userId The ID of the new user.
 * @param email The email of the new user.
 * @param role The default role for the new user (e.g., 'principal').
 */
export const createProfileForNewUser = async (userId: string, email: string, role: 'principal' | 'foundation' | 'admin' = 'principal') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { id: userId, username: email.split('@')[0], full_name: email, role: role }
    ])
    .select()
    .single(); // Use .single() to return the inserted data

  if (error) {
    console.error('Error creating profile for new user:', error.message, error.details, error.hint);
    throw error;
  }
  return data;
};

/**
 * Fetches all user profiles. Only accessible by admin users.
 * @returns An array of all user profiles.
 */
export const fetchAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching all profiles:', error.message, error.details, error.hint);
    throw error;
  }
  return data || [];
};

/**
 * Updates a user's role in the profiles table.
 * @param userId The ID of the user to update.
 * @param role The new role to assign.
 */
export const updateUserRole = async (userId: string, role: 'principal' | 'foundation' | 'admin') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error.message, error.details, error.hint);
    throw error;
  }
  return data;
};

/**
 * Maps Supabase report data to the ReportData interface.
 * @param report The Supabase report object.
 * @returns The mapped ReportData object.
 */
const mapSupabaseReportToReportData = (report: any): ReportData => ({
  id: report.id,
  date: report.report_date,
  principalName: report.principal_name,
  schoolName: report.school_name,
  period: report.period,
  activities: (report.activities || []).map((activity: any) => ({
    id: activity.id,
    category: activity.category,
    title: activity.title,
    description: activity.description,
    date: activity.activity_date, // Map Supabase 'activity_date' back to client 'date'
    time: activity.time,
    location: activity.location,
    involvedParties: activity.involved_parties, // Map snake_case to camelCase
    participants: activity.participants,
    outcome: activity.outcome,
    islamicValue: activity.islamic_value, // Map snake_case to camelCase
    goals: activity.goals,
    results: activity.results,
    impact: activity.impact,
    challenges: activity.challenges,
    solutions: activity.solutions,
    followUpPlan: activity.follow_up_plan, // Map snake_case to camelCase
    documentationLink: activity.documentation_link, // Map snake_case to camelCase
    attachmentLink: activity.attachment_link, // Map snake_case to camelCase
    additionalNotes: activity.additional_notes, // Map snake_case to camelCase
  })),
  achievements: (report.achievements || []).map((achievement: any) => ({
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    impact: achievement.impact,
    evidence: achievement.evidence,
  })),
  challenges: [], // Not directly stored in reports table, will be derived or handled differently
  plans: [],     // Not directly stored in reports table, will be derived or handled differently
  principalEvaluation: report.principal_evaluation || {}, // Map new field
  foundationEvaluation: report.foundation_evaluation || {}, // Map new field
  foundationComment: report.foundation_comment || '', // Map new field
  submittedAt: report.submitted_at,
  status: report.status as 'draft' | 'submitted' | 'approved',
});

/**
 * Fetches all reports for the current user or all reports if the user is 'foundation' or 'admin'.
 * @param userId The ID of the current user.
 * @param userRole The role of the current user.
 * @returns An array of ReportData.
 */
export const fetchReports = async (userId: string, userRole: 'principal' | 'foundation' | 'admin'): Promise<ReportData[]> => {
  console.log(`Fetching reports for user ${userId} with role ${userRole} at ${new Date().toISOString()}`);

  let query = supabase
    .from('reports')
    .select(`
      *,
      activities (*),
      achievements (*)
    `)
    .order('report_date', { ascending: false });

  // Filter logic based on user role
  if (userRole === 'principal') {
    // Principal only sees their own reports (all statuses)
    query = query.eq('user_id', userId);
  } else if (userRole === 'foundation') {
    // Foundation only sees submitted and approved reports (not drafts)
    query = query.in('status', ['submitted', 'approved']);
  }
  // Admin sees all reports regardless of status

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reports:', error.message, error.details, error.hint);
    return [];
  }

  console.log(`Fetched ${data?.length || 0} reports from database:`, data?.map(r => ({ id: r.id, status: r.status })));

  return data.map(mapSupabaseReportToReportData);
};

/**
 * Fetches a single report by its ID.
 * @param reportId The ID of the report to fetch.
 * @returns The ReportData object or null if not found.
 */
export const fetchSingleReport = async (reportId: string): Promise<ReportData | null> => {
  console.log(`[supabaseService] Fetching single report with ID: ${reportId}`);
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      activities (*),
      achievements (*)
    `)
    .eq('id', reportId)
    .single();

  if (error) {
    console.error(`[supabaseService] Error fetching report ${reportId}:`, error.message, error.details, error.hint);
    return null;
  }

  if (!data) {
    console.log(`[supabaseService] Report ${reportId} not found.`);
    return null;
  }

  console.log(`[supabaseService] Successfully fetched report ${reportId}.`);
  return mapSupabaseReportToReportData(data);
};

/**
 * Saves a new report or updates an existing one.
 * @param reportData The report data to save.
 * @param userId The ID of the user creating/updating the report.
 * @returns The saved/updated report data.
 */
export const saveReportToSupabase = async (reportData: ReportData, userId: string): Promise<ReportData> => {
  const { id, date, principalName, schoolName, period, principalEvaluation, foundationEvaluation, foundationComment, status, submittedAt, activities, achievements } = reportData;

  const reportPayload = {
    user_id: userId,
    report_date: date,
    principal_name: principalName,
    school_name: schoolName,
    period: period,
    principal_evaluation: principalEvaluation, // Include new field in payload
    foundation_evaluation: foundationEvaluation, // Include new field in payload
    foundation_comment: foundationComment, // Include new field in payload
    status: status,
    submitted_at: submittedAt,
    updated_at: new Date().toISOString(),
  };

  let savedReport: any;
  if (id && id.trim() !== '') { // Existing report with valid ID, update
    const { data, error } = await supabase
      .from('reports')
      .update(reportPayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating report:', error.message, error.details, error.hint);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn(`Report with ID ${id} not found, creating new record instead`);
      // If update failed because record doesn't exist, create new one
      const { data: newData, error: insertError } = await supabase
        .from('reports')
        .insert([reportPayload])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new report:', insertError.message, insertError.details, insertError.hint);
        throw insertError;
      }
      savedReport = newData;
    } else {
      savedReport = data[0];
    }
  } else { // New report, insert
    const { data, error } = await supabase
      .from('reports')
      .insert([reportPayload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting report:', error.message, error.details, error.hint);
      throw error;
    }
    savedReport = data;
  }

  // Handle activities
  if (activities) {
    // Delete old activities not present in current activities
    const existingActivityIds = activities.filter(a => a.id && a.id.trim() !== '' && !isTemporaryId(a.id)).map(a => a.id);
    if (existingActivityIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('report_id', savedReport.id)
        .filter('id', 'not.in', `(${existingActivityIds.join(',')})`); // FIX: Changed .not('id', 'in', ...) to .filter('id', 'not.in', ...)
      if (deleteError) console.error('Error deleting old activities:', deleteError.message, deleteError.details, deleteError.hint);
    } else { // If no existing activities, delete all for this report
      const { error: deleteError } = await supabase
        .from('activities')
        .delete()
        .eq('report_id', savedReport.id);
      if (deleteError) console.error('Error deleting all activities:', deleteError.message, deleteError.details, deleteError.hint);
    }

    // Prepare activity payloads, omitting 'id' for new activities
    const activityPayloads = activities.map(activity => {
      const payload: any = {
        report_id: savedReport.id,
        category: activity.category,
        title: activity.title,
        description: activity.description,
        activity_date: activity.date,
        time: activity.time,
        location: activity.location,
        involved_parties: activity.involvedParties,
        participants: activity.participants,
        outcome: activity.outcome,
        islamic_value: activity.islamicValue,
        goals: activity.goals,
        results: activity.results,
        impact: activity.impact,
        challenges: activity.challenges,
        solutions: activity.solutions,
        follow_up_plan: activity.followUpPlan,
        documentation_link: activity.documentationLink,
        attachment_link: activity.attachmentLink,
        additional_notes: activity.additionalNotes,
      };
      if (activity.id && activity.id.trim() !== '' && !isTemporaryId(activity.id)) {
        payload.id = activity.id;
      }
      return payload;
    });

    const { error: upsertActivitiesError } = await supabase
      .from('activities')
      .upsert(activityPayloads, { onConflict: 'id' });

    if (upsertActivitiesError) {
      console.error('Error upserting activities:', upsertActivitiesError.message, upsertActivitiesError.details, upsertActivitiesError.hint);
      throw upsertActivitiesError;
    }
  }

  // Handle achievements
  if (achievements) {
    // Delete old achievements not present in current achievements
    const existingAchievementIds = achievements.filter(a => a.id && a.id.trim() !== '' && !isTemporaryId(a.id)).map(a => a.id);
    if (existingAchievementIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('achievements')
        .delete()
        .eq('report_id', savedReport.id)
        .filter('id', 'not.in', `(${existingAchievementIds.join(',')})`); // FIX: Changed .not('id', 'in', ...) to .filter('id', 'not.in', ...)
      if (deleteError) console.error('Error deleting old achievements:', deleteError.message, deleteError.details, deleteError.hint);
    } else { // If no existing achievements, delete all for this report
      const { error: deleteError } = await supabase
        .from('achievements')
        .delete()
        .eq('report_id', savedReport.id);
      if (deleteError) console.error('Error deleting all achievements:', deleteError.message, deleteError.details, deleteError.hint);
    }

    // Prepare achievement payloads, omitting 'id' for new achievements
    const achievementPayloads = achievements.map(achievement => {
      const payload: any = {
        report_id: savedReport.id,
        title: achievement.title,
        description: achievement.description,
        impact: achievement.impact,
        evidence: achievement.evidence,
      };
      if (achievement.id && achievement.id.trim() !== '' && !isTemporaryId(achievement.id)) {
        payload.id = achievement.id;
      }
      return payload;
    });

    const { error: upsertAchievementsError } = await supabase
      .from('achievements')
      .upsert(achievementPayloads, { onConflict: 'id' });

    if (upsertAchievementsError) {
      console.error('Error upserting achievements:', upsertAchievementsError.message, upsertAchievementsError.details, upsertAchievementsError.hint);
      throw upsertAchievementsError;
    }
  }

  // Re-fetch the complete report with all nested data to ensure consistency
  const { data: fullReport, error: fetchError } = await supabase
    .from('reports')
    .select(`
      *,
      activities (*),
      achievements (*)
    `)
    .eq('id', savedReport.id)
    .single();

  if (fetchError) {
    console.error('Error re-fetching full report:', fetchError.message, fetchError.details, fetchError.hint);
    throw fetchError;
  }

  // Map the re-fetched full report to ReportData interface
  return mapSupabaseReportToReportData(fullReport);
};

/**
 * Deletes a report and its associated activities and achievements from Supabase.
 * @param reportId The ID of the report to delete.
 */
export const deleteReportFromSupabase = async (reportId: string): Promise<void> => {
  console.log(`=== STARTING DELETION PROCESS FOR REPORT ${reportId} ===`);

  // Check current user authentication
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current authenticated user:', user?.id);

  // First, verify the report exists and check ownership
  const { data: reportExists, error: fetchError } = await supabase
    .from('reports')
    .select('id, user_id, principal_name')
    .eq('id', reportId)
    .single();

  if (fetchError) {
    console.error('Error fetching report for deletion:', fetchError);
    throw fetchError;
  }

  if (!reportExists) {
    console.log(`Report ${reportId} not found in database - already deleted`);
    return;
  }

  console.log('Report details:', {
    id: reportExists.id,
    user_id: reportExists.user_id,
    current_user: user?.id,
    can_delete: reportExists.user_id === user?.id
  });

  // First, delete associated activities
  console.log(`Deleting activities for report ${reportId}`);
  const { data: deletedActivities, error: activitiesError } = await supabase
    .from('activities')
    .delete()
    .eq('report_id', reportId)
    .select('id');

  if (activitiesError) {
    console.error('Error deleting associated activities:', activitiesError.message, activitiesError.details, activitiesError.hint);
    throw activitiesError;
  }
  console.log(`Deleted ${deletedActivities?.length || 0} activities`);

  // Then, delete associated achievements
  console.log(`Deleting achievements for report ${reportId}`);
  const { data: deletedAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .delete()
    .eq('report_id', reportId)
    .select('id');

  if (achievementsError) {
    console.error('Error deleting associated achievements:', achievementsError.message, achievementsError.details, achievementsError.hint);
    throw achievementsError;
  }
  console.log(`Deleted ${deletedAchievements?.length || 0} achievements`);

  // Finally, delete the report itself
  console.log(`Deleting report ${reportId}`);
  const { data: deletedReport, error: reportError } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .select('id');

  if (reportError) {
    console.error('Error deleting report via direct query:', reportError.message, reportError.details, reportError.hint);
    console.log('Attempting to use stored function as fallback...');

    // Fallback: Try using stored function
    const { error: functionError } = await supabase
      .rpc('delete_user_report', { report_id: reportId });

    if (functionError) {
      console.error('Error deleting via function:', functionError.message, functionError.details, functionError.hint);
      throw new Error(`Both direct delete and function failed: ${reportError.message} | ${functionError.message}`);
    }

    console.log('Report deleted successfully via stored function');
  } else {
    console.log('Report deletion successful via direct query:', deletedReport);
  }

  // Verify deletion by trying to fetch the report again
  const { data: verifyReport } = await supabase
    .from('reports')
    .select('id')
    .eq('id', reportId)
    .single();

  if (verifyReport) {
    console.error(`WARNING: Report ${reportId} still exists after deletion!`);
    throw new Error(`Report deletion failed - record still exists`);
  }

  console.log(`=== DELETION VERIFIED: Report ${reportId} no longer exists in database ===`);
};

/**
 * Fetches all RABs for a specific user.
 * @param userId The ID of the current user.
 * @param userRole The role of the current user.
 * @returns An array of RABData.
 */
export const fetchRABs = async (userId: string, userRole: 'principal' | 'foundation' | 'admin' = 'principal'): Promise<RABData[]> => {
  console.log(`[supabaseService] fetchRABs called for userId: ${userId}, userRole: ${userRole}`); // New log here

  let query = supabase
    .from('rab_data')
    .select(`
      *,
      expense_items (*)
    `)
    .order('created_at', { ascending: false });

  if (userRole === 'principal') {
    query = query.eq('user_id', userId);
  } else if (userRole === 'foundation') {
    query = query.in('status', ['submitted', 'approved']);
  }
  // Admin sees all RABs

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching RABs:', error.message, error.details, error.hint);
    return [];
  }

  console.log(`Fetched ${data?.length || 0} RABs from database.`);

  // Map Supabase data to RABData interface
  return data.map((rab: any) => {
    const routineExpenses: ExpenseItem[] = [];
    const incidentalExpenses: ExpenseItem[] = [];

    (rab.expense_items || []).forEach((item: any) => {
      const mappedItem: ExpenseItem = {
        id: item.id,
        description: item.description,
        volume: item.volume === null ? '' : item.volume, // FIX: Convert null to ''
        unit: item.unit === null ? '' : item.unit as UnitType, // FIX: Convert null to ''
        unitPrice: item.unit_price === null ? '' : item.unit_price, // FIX: Convert null to ''
        amount: item.amount,
        sourceOfFund: item.source_of_fund === null ? '' : item.source_of_fund as SourceOfFund, // FIX: Convert null to ''
        estimatedWeek: item.estimated_week === null ? '' : item.estimated_week as WeekNumber, // FIX: Convert null to ''
      };
      if (item.type === 'routine') {
        routineExpenses.push(mappedItem);
      } else if (item.type === 'incidental') {
        incidentalExpenses.push(mappedItem);
      }
    });

    // Calculate weeklySummary on the client side
    const weeklySummary = calculateWeeklySummary(routineExpenses, incidentalExpenses);

    return {
      id: rab.id,
      user_id: rab.user_id,
      status: rab.status || 'draft',
      submittedAt: rab.submitted_at || undefined,
      reviewedAt: rab.reviewed_at || undefined,
      reviewComment: rab.review_comment || undefined,
      institutionName: rab.institution_name,
      period: rab.period,
      year: rab.year,
      routineExpenses: routineExpenses,
      incidentalExpenses: incidentalExpenses,
      weeklySummary: weeklySummary,
      // Map new signature fields
      signatureKabidUmum: rab.signature_kabid_umum,
      signatureBendaharaYayasan: rab.signature_bendahara_yayasan,
      signatureSekretarisYayasan: rab.signature_sekretaris_yayasan,
      signatureKetuaYayasan: rab.signature_ketua_yayasan,
      signatureKepalaMTA: rab.signature_kepala_mta,
    };
  });
};

/**
 * Saves a new RAB or updates an existing one.
 * @param rabData The RAB data to save.
 * @param userId The ID of the user creating/updating the RAB.
 * @returns The saved/updated RAB data.
 */
export const saveRABToSupabase = async (rabData: RABData, userId: string): Promise<RABData> => {
  const {
    id,
    status,
    submittedAt,
    reviewedAt,
    reviewComment,
    institutionName,
    period,
    year,
    routineExpenses,
    incidentalExpenses,
    signatureKabidUmum,
    signatureBendaharaYayasan,
    signatureSekretarisYayasan,
    signatureKetuaYayasan,
    signatureKepalaMTA,
  } = rabData;

  const rabPayload = {
    user_id: userId,
    status: status || 'draft',
    submitted_at: submittedAt,
    reviewed_at: reviewedAt,
    review_comment: reviewComment,
    institution_name: institutionName,
    period: period,
    year: year,
    updated_at: new Date().toISOString(),
    // Include new signature fields in payload
    signature_kabid_umum: signatureKabidUmum,
    signature_bendahara_yayasan: signatureBendaharaYayasan,
    signature_sekretaris_yayasan: signatureSekretarisYayasan,
    signature_ketua_yayasan: signatureKetuaYayasan,
    signature_kepala_mta: signatureKepalaMTA,
  };

  let savedRAB: any;
  if (id && id.trim() !== '' && !isTemporaryId(id)) { // Existing RAB with valid ID, update
    const { data, error } = await supabase
      .from('rab_data')
      .update(rabPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RAB:', error.message, error.details, error.hint);
      throw error;
    }
    savedRAB = data;
  } else { // New RAB, insert
    const { data, error } = await supabase
      .from('rab_data')
      .insert([rabPayload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting RAB:', error.message, error.details, error.hint);
      throw error;
    }
    savedRAB = data;
  }

  // Combine all expense items and assign UUIDs to new ones
  let allExpenseItemsWithUUIDs = [
    ...routineExpenses.map(item => ({ ...item, type: 'routine' })),
    ...incidentalExpenses.map(item => ({ ...item, type: 'incidental' }))
  ].map(item => {
    if (isTemporaryId(item.id)) {
      // Assign a new UUID for temporary client-side IDs
      return { ...item, id: crypto.randomUUID() };
    }
    return item;
  });

  console.log(`[saveRABToSupabase] RAB ID: ${savedRAB.id}`);
  console.log(`[saveRABToSupabase] All expense items (after UUID assignment) (${allExpenseItemsWithUUIDs.length}):`, allExpenseItemsWithUUIDs.map(item => ({ id: item.id, desc: item.description })));

  const currentExpenseItemIds = allExpenseItemsWithUUIDs.map(item => item.id);
  console.log(`[saveRABToSupabase] Expense item IDs to KEEP (all current items):`, currentExpenseItemIds);

  // Delete old expense items that are no longer in the current list
  if (currentExpenseItemIds.length > 0) {
    console.log(`[saveRABToSupabase] Attempting to delete expense items for RAB ${savedRAB.id} NOT IN IDs:`, currentExpenseItemIds);
    const { error: deleteError } = await supabase
      .from('expense_items')
      .delete()
      .eq('rab_id', savedRAB.id)
      .filter('id', 'not.in', `(${currentExpenseItemIds.join(',')})`); // Corrected filter syntax
    if (deleteError) {
      console.error('[saveRABToSupabase] Error deleting old expense items:', deleteError.message, deleteError.details, deleteError.hint);
      throw deleteError;
    } else {
      console.log(`[saveRABToSupabase] Successfully deleted expense items NOT IN IDs:`, currentExpenseItemIds);
    }
  } else { // If no current items, delete all for this RAB
    console.log(`[saveRABToSupabase] No current expense items. Deleting ALL expense items for RAB ${savedRAB.id}.`);
    const { error: deleteError } = await supabase
      .from('expense_items')
      .delete()
      .eq('rab_id', savedRAB.id);
    if (deleteError) {
      console.error('[saveRABToSupabase] Error deleting all expense items:', deleteError.message, deleteError.details, deleteError.hint);
      throw deleteError;
    } else {
      console.log(`[saveRABToSupabase] Successfully deleted ALL expense items for RAB ${savedRAB.id}.`);
    }
  }

  // Prepare expense item payloads. All items in `allExpenseItemsWithUUIDs` now have a proper `id`.
  const expenseItemPayloads = allExpenseItemsWithUUIDs.map(item => {
    const payload: any = {
      id: item.id, // Always include the ID now
      rab_id: savedRAB.id,
      type: item.type,
      description: item.description,
      volume: item.volume === '' ? null : item.volume,
      unit: item.unit === '' ? null : item.unit,
      unit_price: item.unitPrice === '' ? null : item.unitPrice,
      amount: item.amount,
      source_of_fund: item.sourceOfFund === '' ? null : item.sourceOfFund,
      estimated_week: item.estimatedWeek === '' ? null : item.estimatedWeek,
    };
    return payload;
  });

  console.log(`[saveRABToSupabase] Preparing ${expenseItemPayloads.length} expense item payloads for upsert.`);
  const { error: upsertExpenseItemsError } = await supabase
    .from('expense_items')
    .upsert(expenseItemPayloads, { onConflict: 'id' });

  if (upsertExpenseItemsError) {
    console.error('[saveRABToSupabase] Error upserting expense items:', upsertExpenseItemsError.message, upsertExpenseItemsError.details, upsertExpenseItemsError.hint);
    throw upsertExpenseItemsError;
  } else {
    console.log(`[saveRABToSupabase] Successfully upserted ${expenseItemPayloads.length} expense items.`);
  }

  // Re-fetch the complete RAB with all nested data to ensure consistency
  const { data: fullRAB, error: fetchError } = await supabase
    .from('rab_data')
    .select(`
      *,
      expense_items (*)
    `)
    .eq('id', savedRAB.id)
    .single();

  if (fetchError) {
    console.error('[saveRABToSupabase] Error re-fetching full RAB after save:', fetchError.message, fetchError.details, fetchError.hint);
    throw fetchError;
  }
  console.log(`[saveRABToSupabase] Re-fetched full RAB (${fullRAB.id}) with ${fullRAB.expense_items?.length || 0} expense items.`);

  // Map the re-fetched full RAB to RABData interface
  const reFetchedRoutineExpenses: ExpenseItem[] = []; // Renamed to avoid conflict
  const reFetchedIncidentalExpenses: ExpenseItem[] = []; // Renamed to avoid conflict

  (fullRAB.expense_items || []).forEach((item: any) => {
    const mappedItem: ExpenseItem = {
      id: item.id,
      description: item.description,
      volume: item.volume === null ? '' : item.volume, // FIX: Convert null to ''
      unit: item.unit === null ? '' : item.unit as UnitType, // FIX: Convert null to ''
      unitPrice: item.unit_price === null ? '' : item.unit_price, // FIX: Convert null to ''
      amount: item.amount,
      sourceOfFund: item.source_of_fund === null ? '' : item.source_of_fund as SourceOfFund, // FIX: Convert null to ''
      estimatedWeek: item.estimated_week === null ? '' : item.estimated_week as WeekNumber, // FIX: Convert null to ''
    };

    if (item.type === 'routine') {
      reFetchedRoutineExpenses.push(mappedItem);
    } else if (item.type === 'incidental') {
      reFetchedIncidentalExpenses.push(mappedItem);
    }
  });

  const weeklySummary = calculateWeeklySummary(reFetchedRoutineExpenses, reFetchedIncidentalExpenses);

  return {
    id: fullRAB.id,
    user_id: fullRAB.user_id,
    status: fullRAB.status || 'draft',
    submittedAt: fullRAB.submitted_at || undefined,
    reviewedAt: fullRAB.reviewed_at || undefined,
    reviewComment: fullRAB.review_comment || undefined,
    institutionName: fullRAB.institution_name,
    period: fullRAB.period,
    year: fullRAB.year,
    routineExpenses: reFetchedRoutineExpenses,
    incidentalExpenses: reFetchedIncidentalExpenses,
    weeklySummary: weeklySummary,
    // Map new signature fields
    signatureKabidUmum: fullRAB.signature_kabid_umum,
    signatureBendaharaYayasan: fullRAB.signature_bendahara_yayasan,
    signatureSekretarisYayasan: fullRAB.signature_sekretaris_yayasan, // Corrected from fullR
    signatureKetuaYayasan: fullRAB.signature_ketua_yayasan,
    signatureKepalaMTA: fullRAB.signature_kepala_mta,
  };
};

/**
 * Deletes a RAB and its associated expense items from Supabase.
 * @param rabId The ID of the RAB to delete.
 */
export const deleteRABFromSupabase = async (rabId: string): Promise<void> => {
  console.log(`Deleting RAB ${rabId}`);
  const { error } = await supabase
    .from('rab_data')
    .delete()
    .eq('id', rabId);

  if (error) {
    console.error('Error deleting RAB:', error.message, error.details, error.hint);
    throw error;
  }
  console.log(`RAB ${rabId} deleted successfully.`);
};

// Helper function to calculate weekly summary (client-side)
const calculateWeeklySummary = (routineExpenses: ExpenseItem[], incidentalExpenses: ExpenseItem[]) => {
  const summary: { [key in SourceOfFund]: number[] } = {
    'Yayasan': [0, 0, 0, 0, 0],
    'Bos': [0, 0, 0, 0, 0],
    'Komite': [0, 0, 0, 0, 0],
    'Donasi': [0, 0, 0, 0, 0],
    '': [0, 0, 0, 0, 0], // For items without a source selected
  };

  [...routineExpenses, ...incidentalExpenses].forEach(item => {
    if (item.sourceOfFund && item.estimatedWeek) {
      const weekIndex = parseInt(item.estimatedWeek.replace('Pekan ', '')) - 1;
      if (weekIndex >= 0 && weekIndex < 5) {
        summary[item.sourceOfFund][weekIndex] += item.amount;
      }
    }
  });

  const totalPerWeek = summary['Yayasan'].map((_, i) =>
    summary['Yayasan'][i] + summary['Bos'][i] + summary['Komite'][i] + summary['Donasi'][i]
  );

  return {
    yayasan: summary['Yayasan'],
    bos: summary['Bos'],
    komite: summary['Komite'],
    donasi: summary['Donasi'],
    total: totalPerWeek,
  };
};

/**
 * Submits RAB to foundation for review
 * @param rabId The ID of the RAB to submit
 * @param userId The ID of the user submitting the RAB
 * @returns The updated RAB data
 */
export const submitRABToFoundation = async (rabId: string, userId: string): Promise<RABData> => {
  // Validate ownership
  const { data, error } = await supabase
    .from('rab_data')
    .select('*')
    .eq('id', rabId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error validating RAB for submission:', error);
    throw error;
  }

  if (!data) {
    throw new Error('RAB tidak ditemukan atau tidak memiliki akses');
  }

  // Persist submitted status
  const { error: updateError } = await supabase
    .from('rab_data')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', rabId);

  if (updateError) {
    console.error('Error updating RAB status to submitted:', updateError);
    throw updateError;
  }

  // Re-fetch the complete RAB with all nested data
  const { data: fullRAB, error: fetchError } = await supabase
    .from('rab_data')
    .select(`
      *,
      expense_items (*)
    `)
    .eq('id', rabId)
    .single();

  if (fetchError) {
    console.error('Error re-fetching full RAB after submit:', fetchError);
    throw fetchError;
  }

  // Map the data back to RABData interface (similar to existing mapping logic)
  const routineExpenses: ExpenseItem[] = [];
  const incidentalExpenses: ExpenseItem[] = [];

  (fullRAB.expense_items || []).forEach((item: any) => {
    const mappedItem: ExpenseItem = {
      id: item.id,
      description: item.description,
      volume: item.volume === null ? '' : item.volume,
      unit: item.unit === null ? '' : item.unit,
      unitPrice: item.unit_price === null ? '' : item.unit_price,
      amount: item.amount,
      sourceOfFund: item.source_of_fund === null ? '' : item.source_of_fund,
      estimatedWeek: item.estimated_week === null ? '' : item.estimated_week,
    };

    if (item.type === 'routine') {
      routineExpenses.push(mappedItem);
    } else if (item.type === 'incidental') {
      incidentalExpenses.push(mappedItem);
    }
  });

  const weeklySummary = calculateWeeklySummary(routineExpenses, incidentalExpenses);

  return {
    id: fullRAB.id,
    user_id: fullRAB.user_id,
    status: fullRAB.status || 'submitted',
    submittedAt: fullRAB.submitted_at || new Date().toISOString(),
    reviewedAt: fullRAB.reviewed_at || undefined,
    reviewComment: fullRAB.review_comment || undefined,
    institutionName: fullRAB.institution_name,
    period: fullRAB.period,
    year: fullRAB.year,
    routineExpenses,
    incidentalExpenses,
    weeklySummary,
    signatureKabidUmum: fullRAB.signature_kabid_umum,
    signatureBendaharaYayasan: fullRAB.signature_bendahara_yayasan,
    signatureSekretarisYayasan: fullRAB.signature_sekretaris_yayasan,
    signatureKetuaYayasan: fullRAB.signature_ketua_yayasan,
    signatureKepalaMTA: fullRAB.signature_kepala_mta,
  };
};

/**
 * Approves an RAB.
 * @param rabId The ID of the RAB to approve.
 * @param userId The ID of the user approving the RAB.
 * @param reviewComment The comment from the foundation.
 * @returns The updated RAB data.
 */
export const approveRAB = async (rabId: string, userId: string, reviewComment?: string): Promise<RABData> => {
  const { data, error } = await supabase
    .from('rab_data')
    .update({
      status: 'approved',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      review_comment: reviewComment || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rabId)
    .select(`*, expense_items (*)`) // Select all fields including nested expense_items
    .single();

  if (error) {
    console.error('Error approving RAB:', error.message, error.details, error.hint);
    throw error;
  }

  // Map the data back to RABData interface
  const routineExpenses: ExpenseItem[] = [];
  const incidentalExpenses: ExpenseItem[] = [];

  (data.expense_items || []).forEach((item: any) => {
    const mappedItem: ExpenseItem = {
      id: item.id,
      description: item.description,
      volume: item.volume === null ? '' : item.volume,
      unit: item.unit === null ? '' : item.unit,
      unitPrice: item.unit_price === null ? '' : item.unit_price,
      amount: item.amount,
      sourceOfFund: item.source_of_fund === null ? '' : item.source_of_fund,
      estimatedWeek: item.estimated_week === null ? '' : item.estimated_week,
    };

    if (item.type === 'routine') {
      routineExpenses.push(mappedItem);
    } else if (item.type === 'incidental') {
      incidentalExpenses.push(mappedItem);
    }
  });

  const weeklySummary = calculateWeeklySummary(routineExpenses, incidentalExpenses);

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status as 'approved',
    submittedAt: data.submitted_at || undefined,
    reviewedAt: data.reviewed_at || undefined,
    reviewComment: data.review_comment || undefined,
    institutionName: data.institution_name,
    period: data.period,
    year: data.year,
    routineExpenses,
    incidentalExpenses,
    weeklySummary,
    signatureKabidUmum: data.signature_kabid_umum,
    signatureBendaharaYayasan: data.signature_bendahara_yayasan,
    signatureSekretarisYayasan: data.signature_sekretaris_yayasan,
    signatureKetuaYayasan: data.signature_ketua_yayasan,
    signatureKepalaMTA: data.signature_kepala_mta,
  };
};

/**
 * Rejects an RAB.
 * @param rabId The ID of the RAB to reject.
 * @param userId The ID of the user rejecting the RAB.
 * @param reviewComment The comment from the foundation.
 * @returns The updated RAB data.
 */
export const rejectRAB = async (rabId: string, userId: string, reviewComment: string): Promise<RABData> => {
  const { data, error } = await supabase
    .from('rab_data')
    .update({
      status: 'rejected',
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      review_comment: reviewComment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', rabId)
    .select(`*, expense_items (*)`) // Select all fields including nested expense_items
    .single();

  if (error) {
    console.error('Error rejecting RAB:', error.message, error.details, error.hint);
    throw error;
  }

  // Map the data back to RABData interface
  const routineExpenses: ExpenseItem[] = [];
  const incidentalExpenses: ExpenseItem[] = [];

  (data.expense_items || []).forEach((item: any) => {
    const mappedItem: ExpenseItem = {
      id: item.id,
      description: item.description,
      volume: item.volume === null ? '' : item.volume,
      unit: item.unit === null ? '' : item.unit,
      unitPrice: item.unit_price === null ? '' : item.unit_price,
      amount: item.amount,
      sourceOfFund: item.source_of_fund === null ? '' : item.source_of_fund,
      estimatedWeek: item.estimated_week === null ? '' : item.estimated_week,
    };

    if (item.type === 'routine') {
      routineExpenses.push(mappedItem);
    } else if (item.type === 'incidental') {
      incidentalExpenses.push(mappedItem);
    }
  });

  const weeklySummary = calculateWeeklySummary(routineExpenses, incidentalExpenses);

  return {
    id: data.id,
    user_id: data.user_id,
    status: data.status as 'rejected',
    submittedAt: data.submitted_at || undefined,
    reviewedAt: data.reviewed_at || undefined,
    reviewComment: data.review_comment || undefined,
    institutionName: data.institution_name,
    period: data.period,
    year: data.year,
    routineExpenses,
    incidentalExpenses,
    weeklySummary,
    signatureKabidUmum: data.signature_kabid_umum,
    signatureBendaharaYayasan: data.signature_bendahara_yayasan,
    signatureSekretarisYayasan: data.signature_sekretaris_yayasan,
    signatureKetuaYayasan: data.signature_ketua_yayasan,
    signatureKepalaMTA: data.signature_kepala_mta,
  };
};

// ===== RAB REALIZATION FUNCTIONS =====

/**
 * Fetches all realizations for a specific user or all realizations for foundation/admin.
 * @param userId The ID of the current user.
 * @param userRole The role of the current user.
 * @returns An array of RABRealization.
 */
export const fetchRealizations = async (userId: string, userRole: 'principal' | 'foundation' | 'admin' = 'principal'): Promise<RABRealization[]> => {
  console.log(`[supabaseService] fetchRealizations called for userId: ${userId}, userRole: ${userRole}`);

  let query = supabase
    .from('rab_realizations')
    .select(`
      *,
      realization_items (*)
    `)
    .order('created_at', { ascending: false });

  if (userRole === 'principal') {
    query = query.eq('user_id', userId);
  } else if (userRole === 'foundation') {
    query = query.in('status', ['submitted', 'approved', 'completed']);
  }
  // Admin sees all realizations

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching realizations:', error.message, error.details, error.hint);
    return [];
  }

  console.log(`Fetched ${data?.length || 0} realizations from database.`);

  // Map Supabase data to RABRealization interface
  return data.map((realization: any) => {
    const realizationItems: RealizationItem[] = (realization.realization_items || []).map((item: any) => ({
      id: item.id,
      expenseItemId: item.expense_item_id,
      description: item.description,
      plannedAmount: item.planned_amount,
      actualAmount: item.actual_amount,
      actualDate: item.actual_date,
      receipt: item.receipt,
      notes: item.notes,
    }));

    return {
      id: realization.id,
      rabId: realization.rab_id,
      user_id: realization.user_id,
      status: realization.status,
      realizationItems: realizationItems,
      totalPlanned: realization.total_planned,
      totalActual: realization.total_actual,
      variance: realization.variance,
      createdAt: realization.created_at,
      updatedAt: realization.updated_at,
      submittedAt: realization.submitted_at,
      approvedAt: realization.approved_at,
    };
  });
};

/**
 * Saves a new realization or updates an existing one.
 * @param realizationData The realization data to save.
 * @param userId The ID of the user creating/updating the realization.
 * @returns The saved/updated realization data.
 */
export const saveRealizationToSupabase = async (realizationData: RABRealization, userId: string): Promise<RABRealization> => {
  const {
    id,
    rabId,
    status,
    realizationItems,
    totalPlanned,
    totalActual,
    variance,
    submittedAt,
    approvedAt,
  } = realizationData;

  const realizationPayload = {
    rab_id: rabId,
    user_id: userId,
    status: status || 'in_progress',
    total_planned: totalPlanned,
    total_actual: totalActual,
    variance: variance,
    submitted_at: submittedAt,
    approved_at: approvedAt,
    updated_at: new Date().toISOString(),
  };

  let savedRealization: any;
  if (id && id.trim() !== '' && !isTemporaryId(id)) {
    const { data, error } = await supabase
      .from('rab_realizations')
      .update(realizationPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating realization:', error.message, error.details, error.hint);
      throw error;
    }
    savedRealization = data;
  } else {
    const { data, error } = await supabase
      .from('rab_realizations')
      .insert([realizationPayload])
      .select()
      .single();

    if (error) {
      console.error('Error inserting realization:', error.message, error.details, error.hint);
      throw error;
    }
    savedRealization = data;
  }

  // Handle realization items
  const currentItemIds = realizationItems.filter(item => item.id && !isTemporaryId(item.id)).map(item => item.id);

  if (currentItemIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('realization_items')
      .delete()
      .eq('realization_id', savedRealization.id)
      .filter('id', 'not.in', `(${currentItemIds.join(',')})`);
    if (deleteError) console.error('Error deleting old realization items:', deleteError.message);
  } else {
    const { error: deleteError } = await supabase
      .from('realization_items')
      .delete()
      .eq('realization_id', savedRealization.id);
    if (deleteError) console.error('Error deleting all realization items:', deleteError.message);
  }

  // Prepare realization item payloads
  const itemPayloads = realizationItems.map(item => ({
    id: isTemporaryId(item.id) ? undefined : item.id,
    realization_id: savedRealization.id,
    expense_item_id: item.expenseItemId,
    description: item.description,
    planned_amount: item.plannedAmount,
    actual_amount: item.actualAmount,
    actual_date: item.actualDate,
    receipt: item.receipt,
    notes: item.notes,
  }));

  const { error: upsertError } = await supabase
    .from('realization_items')
    .upsert(itemPayloads, { onConflict: 'id' });

  if (upsertError) {
    console.error('Error upserting realization items:', upsertError.message);
    throw upsertError;
  }

  // Re-fetch the complete realization
  const { data: fullRealization, error: fetchError } = await supabase
    .from('rab_realizations')
    .select(`
      *,
      realization_items (*)
    `)
    .eq('id', savedRealization.id)
    .single();

  if (fetchError) {
    console.error('Error re-fetching full realization:', fetchError.message);
    throw fetchError;
  }

  const mappedItems: RealizationItem[] = (fullRealization.realization_items || []).map((item: any) => ({
    id: item.id,
    expenseItemId: item.expense_item_id,
    description: item.description,
    plannedAmount: item.planned_amount,
    actualAmount: item.actual_amount,
    actualDate: item.actual_date,
    receipt: item.receipt,
    notes: item.notes,
  }));

  return {
    id: fullRealization.id,
    rabId: fullRealization.rab_id,
    user_id: fullRealization.user_id,
    status: fullRealization.status,
    realizationItems: mappedItems,
    totalPlanned: fullRealization.total_planned,
    totalActual: fullRealization.total_actual,
    variance: fullRealization.variance,
    createdAt: fullRealization.created_at,
    updatedAt: fullRealization.updated_at,
    submittedAt: fullRealization.submitted_at,
    approvedAt: fullRealization.approved_at,
  };
};

/**
 * Deletes a realization and its associated items from Supabase.
 * @param realizationId The ID of the realization to delete.
 */
export const deleteRealizationFromSupabase = async (realizationId: string): Promise<void> => {
  console.log(`Deleting realization ${realizationId}`);
  const { error } = await supabase
    .from('rab_realizations')
    .delete()
    .eq('id', realizationId);

  if (error) {
    console.error('Error deleting realization:', error.message, error.details, error.hint);
    throw error;
  }
  console.log(`Realization ${realizationId} deleted successfully.`);
};

/**
 * Submits a realization to foundation for approval.
 * @param realizationId The ID of the realization to submit.
 * @param userId The ID of the user submitting.
 * @returns The updated realization data.
 */
export const submitRealizationToFoundation = async (realizationId: string, userId: string): Promise<RABRealization> => {
  const { data, error } = await supabase
    .from('rab_realizations')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', realizationId)
    .eq('user_id', userId)
    .select(`
      *,
      realization_items (*)
    `)
    .single();

  if (error) {
    console.error('Error submitting realization:', error.message);
    throw error;
  }

  const mappedItems: RealizationItem[] = (data.realization_items || []).map((item: any) => ({
    id: item.id,
    expenseItemId: item.expense_item_id,
    description: item.description,
    plannedAmount: item.planned_amount,
    actualAmount: item.actual_amount,
    actualDate: item.actual_date,
    receipt: item.receipt,
    notes: item.notes,
  }));

  return {
    id: data.id,
    rabId: data.rab_id,
    user_id: data.user_id,
    status: data.status,
    realizationItems: mappedItems,
    totalPlanned: data.total_planned,
    totalActual: data.total_actual,
    variance: data.variance,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    submittedAt: data.submitted_at,
    approvedAt: data.approved_at,
  };
};
// ===== MEMO FUNCTIONS =====

/**
 * Fetches all memos for a specific user or all memos for foundation/admin.
 * @param userId The ID of the current user.
 * @param userRole The role of the current user.
 * @returns An array of MemoData.
 */
export const fetchMemos = async (userId: string, userRole: 'principal' | 'foundation' | 'admin' = 'principal'): Promise<MemoData[]> => {
  console.log(`[supabaseService] fetchMemos called for userId: ${userId}, userRole: ${userRole}`);

  let query = supabase
    .from('memos')
    .select(`
      *,
      memo_tables (*)
    `)
    .order('created_at', { ascending: false });

  if (userRole === 'principal') {
    query = query.eq('user_id', userId);
  } else if (userRole === 'foundation') {
    // Foundation can see memos sent to them
    console.log('[supabaseService] Filtering memos for foundation - status = sent_to_foundation');
    query = query.eq('status', 'sent_to_foundation');
  }
  // Admin sees all memos

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching memos:', error.message);
    return [];
  }

  console.log(`[supabaseService] Fetched ${data?.length || 0} memos for ${userRole}:`, data?.map(m => ({ id: m.id, status: m.status, memo_number: m.memo_number })));

  return data.map((memo: any) => ({
    id: memo.id,
    user_id: memo.user_id,
    memo_number: memo.memo_number,
    document_title: memo.document_title || 'MEMO INTERNAL',
    subject: memo.subject,
    from: memo.from,
    to: memo.to,
    show_from_to: memo.show_from_to !== false,
    date: memo.memo_date,
    opening: memo.opening,
    description: memo.description,
    signatory_name: memo.signatory_name,
    signatory_role: memo.signatory_role,
    logo_left_url: memo.logo_left_url,
    logo_right_url: memo.logo_right_url,
    signature_url: memo.signature_url,
    stamp_url: memo.stamp_url,
    status: memo.status,
    sent_to_foundation_at: memo.sent_to_foundation_at,
    created_at: memo.created_at,
    updated_at: memo.updated_at,
    tables: (memo.memo_tables || []).sort((a: any, b: any) => a.order_index - b.order_index).map((table: any) => ({
      id: table.id,
      title: table.title,
      headers: table.headers,
      rows: table.rows,
    })),
  }));
};

/**
 * Saves a new memo or updates an existing one.
 * @param memoData The memo data to save.
 * @param userId The ID of the user creating/updating.
 * @returns The saved/updated memo data.
 */
export const saveMemoToSupabase = async (memoData: MemoData, userId: string): Promise<MemoData> => {
  const { id, tables, ...rest } = memoData;

  const memoPayload = {
    ...rest,
    user_id: userId,
    memo_date: memoData.date,
    updated_at: new Date().toISOString(),
  };
  // Remove technical fields from payload to avoid confusion
  delete (memoPayload as any).date;
  delete (memoPayload as any).created_at;

  let savedMemo: any;
  if (id && id.trim() !== '' && !isTemporaryId(id)) {
    const { data, error } = await supabase
      .from('memos')
      .update(memoPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    savedMemo = data;
  } else {
    const { data, error } = await supabase
      .from('memos')
      .insert([{ ...memoPayload }])
      .select()
      .single();

    if (error) throw error;
    savedMemo = data;
  }

  // Handle tables
  const currentTableIds = tables.filter(t => t.id && !isTemporaryId(t.id)).map(t => t.id);

  if (currentTableIds.length > 0) {
    await supabase.from('memo_tables').delete().eq('memo_id', savedMemo.id).filter('id', 'not.in', `(${currentTableIds.join(',')})`);
  } else {
    await supabase.from('memo_tables').delete().eq('memo_id', savedMemo.id);
  }

  const tablePayloads = tables.map((table, index) => {
    const payload: any = {
      memo_id: savedMemo.id,
      title: table.title,
      headers: table.headers,
      rows: table.rows,
      order_index: index
    };
    if (!isTemporaryId(table.id)) {
      payload.id = table.id;
    }
    return payload;
  });

  if (tablePayloads.length > 0) {
    const { error: tablesError } = await supabase.from('memo_tables').upsert(tablePayloads);
    if (tablesError) throw tablesError;
  }

  // Re-fetch to return complete object
  const { data: finalData } = await supabase.from('memos').select('*, memo_tables(*)').eq('id', savedMemo.id).single();

  return {
    id: finalData.id,
    user_id: finalData.user_id,
    memo_number: finalData.memo_number,
    document_title: finalData.document_title || 'MEMO INTERNAL',
    subject: finalData.subject,
    from: finalData.from,
    to: finalData.to,
    show_from_to: finalData.show_from_to !== false,
    date: finalData.memo_date,
    opening: finalData.opening,
    description: finalData.description,
    signatory_name: finalData.signatory_name,
    signatory_role: finalData.signatory_role,
    logo_left_url: finalData.logo_left_url,
    logo_right_url: finalData.logo_right_url,
    signature_url: finalData.signature_url,
    stamp_url: finalData.stamp_url,
    status: finalData.status,
    tables: (finalData.memo_tables || []).sort((a: any, b: any) => a.order_index - b.order_index).map((table: any) => ({
      id: table.id,
      title: table.title,
      headers: table.headers,
      rows: table.rows,
    })),
  };
};

/**
 * Uploads an image for a memo.
 * @param file The file to upload.
 * @param path The path in the storage (e.g. 'logos/left-123.png')
 * @returns The public URL of the uploaded image.
 */
export const uploadMemoImage = async (file: File, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('memos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('memos')
    .getPublicUrl(data.path);

  return publicUrl;
};

/**
 * Deletes a memo.
 */
export const deleteMemoFromSupabase = async (memoId: string): Promise<void> => {
  const { error } = await supabase.from('memos').delete().eq('id', memoId);
  if (error) throw error;
};

/**
 * Sends a memo to foundation by updating its status.
 * @param memoId The ID of the memo to send.
 * @returns The updated memo data.
 */
export const sendMemoToFoundation = async (memoId: string): Promise<MemoData> => {
  const { data, error } = await supabase
    .from('memos')
    .update({
      status: 'sent_to_foundation',
      sent_to_foundation_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', memoId)
    .select('*, memo_tables(*)')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    memo_number: data.memo_number,
    document_title: data.document_title || 'MEMO INTERNAL',
    subject: data.subject,
    from: data.from,
    to: data.to,
    show_from_to: data.show_from_to !== false,
    date: data.memo_date,
    opening: data.opening,
    description: data.description,
    signatory_name: data.signatory_name,
    signatory_role: data.signatory_role,
    logo_left_url: data.logo_left_url,
    logo_right_url: data.logo_right_url,
    signature_url: data.signature_url,
    stamp_url: data.stamp_url,
    status: data.status,
    sent_to_foundation_at: data.sent_to_foundation_at,
    tables: (data.memo_tables || []).sort((a: any, b: any) => a.order_index - b.order_index).map((table: any) => ({
      id: table.id,
      title: table.title,
      headers: table.headers,
      rows: table.rows,
    })),
  };
};
