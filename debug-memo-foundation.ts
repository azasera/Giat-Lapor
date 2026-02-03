// Debug script to check memo foundation access
// Run this in browser console to debug memo visibility

console.log('=== DEBUGGING MEMO FOUNDATION ACCESS ===');

// Check current user
supabase.auth.getUser().then(({ data: { user }, error }) => {
  if (error) {
    console.error('Auth error:', error);
    return;
  }
  
  console.log('Current user:', user?.id, user?.email);
  
  // Check user profile/role
  supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()
    .then(({ data: profile, error: profileError }) => {
      if (profileError) {
        console.error('Profile error:', profileError);
        return;
      }
      
      console.log('User profile:', profile);
      
      // Check all memos in database
      supabase
        .from('memos')
        .select('id, memo_number, status, user_id, created_at')
        .order('created_at', { ascending: false })
        .then(({ data: allMemos, error: memosError }) => {
          if (memosError) {
            console.error('Memos error:', memosError);
            return;
          }
          
          console.log('All memos in database:', allMemos);
          
          // Filter memos with sent_to_foundation status
          const sentMemos = allMemos?.filter(m => m.status === 'sent_to_foundation') || [];
          console.log('Memos with sent_to_foundation status:', sentMemos);
          
          // Check if sent_to_foundation_at column exists
          supabase
            .from('memos')
            .select('sent_to_foundation_at')
            .limit(1)
            .then(({ data, error: columnError }) => {
              if (columnError) {
                console.error('Column check error - sent_to_foundation_at column may not exist:', columnError);
              } else {
                console.log('sent_to_foundation_at column exists:', data);
              }
            });
        });
    });
});

// Test foundation query directly
console.log('Testing foundation query...');
supabase
  .from('memos')
  .select(`
    *,
    memo_tables (*)
  `)
  .eq('status', 'sent_to_foundation')
  .order('created_at', { ascending: false })
  .then(({ data: foundationMemos, error: foundationError }) => {
    if (foundationError) {
      console.error('Foundation query error:', foundationError);
    } else {
      console.log('Foundation memos query result:', foundationMemos);
    }
  });