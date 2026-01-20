export interface MemoTable {
    id: string;
    title: string;
    headers: string[];
    rows: string[][];
}

export interface MemoData {
    id: string;
    user_id: string;
    memo_number: string;
    document_title?: string; // Custom title for document (e.g., "MEMO INTERNAL", "SURAT PERINGATAN", etc.)
    subject: string;
    from: string;
    to: string;
    show_from_to?: boolean; // Toggle to show/hide "Dari" and "Kepada" section
    date: string;
    tables: MemoTable[];
    opening?: string;
    description: string;
    signatory_name: string;
    signatory_role: string;
    logo_left_url?: string;
    logo_right_url?: string;
    signature_url?: string;
    stamp_url?: string;
    created_at?: string;
    updated_at?: string;
    status: 'draft' | 'final';
}
