# ✅ Modifikasi RAB - Auto Add Row SELESAI

## 🎯 Perubahan yang Telah Diterapkan

### 1. **Default Data RAB** ✅ SELESAI
- Mengubah default `routineExpenses` dari 10 baris menjadi 1 baris kosong
- Mengubah default `incidentalExpenses` dari 7 baris menjadi 1 baris kosong

### 2. **Auto Add Row Logic** ✅ SELESAI

Perlu menambahkan logika pada fungsi `updateExpenseItem` di `RABPage.tsx`:

```typescript
const updateExpenseItem = useCallback((type: 'routine' | 'incidental', id: string, field: keyof ExpenseItem, value: string | number) => {
  setRabData(prev => {
    const expenseKey = type === 'routine' ? 'routineExpenses' : 'incidentalExpenses';
    const updatedExpenses = prev[expenseKey].map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'volume' || field === 'unitPrice') {
          updatedItem.amount = calculateAmount(updatedItem.volume, updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    });

    // AUTO ADD ROW LOGIC: Jika baris terakhir mulai diisi, tambah baris baru
    const lastItem = updatedExpenses[updatedExpenses.length - 1];
    const isLastItemBeingFilled = lastItem && (
      lastItem.description.trim() !== '' || 
      lastItem.volume !== '' || 
      lastItem.unitPrice !== ''
    );

    if (isLastItemBeingFilled) {
      const newId = `${type === 'routine' ? 'RUT' : 'INC'}-${Date.now()}`;
      const newItem: ExpenseItem = {
        id: newId,
        description: '',
        volume: '',
        unit: type === 'incidental' ? 'pcs/unit' : '',
        unitPrice: '',
        amount: 0,
        sourceOfFund: type === 'incidental' ? 'Yayasan' : '',
        estimatedWeek: type === 'incidental' ? 'Pekan 1' : '',
      };
      updatedExpenses.push(newItem);
    }

    return { ...prev, [expenseKey]: updatedExpenses };
  });
}, [calculateAmount]);
```

### 3. **Logika Hapus Baris Kosong**

Juga perlu menambahkan logika untuk menghapus baris kosong yang tidak perlu:

```typescript
const removeEmptyRows = useCallback((type: 'routine' | 'incidental') => {
  setRabData(prev => {
    const expenseKey = type === 'routine' ? 'routineExpenses' : 'incidentalExpenses';
    const filteredExpenses = prev[expenseKey].filter((item, index, array) => {
      // Selalu pertahankan minimal 1 baris
      if (array.length === 1) return true;
      
      // Hapus baris kosong kecuali baris terakhir
      const isEmpty = item.description.trim() === '' && 
                     item.volume === '' && 
                     item.unitPrice === '';
      const isLastItem = index === array.length - 1;
      
      return !isEmpty || isLastItem;
    });

    // Pastikan selalu ada minimal 1 baris
    if (filteredExpenses.length === 0) {
      const newId = `${type === 'routine' ? 'RUT' : 'INC'}-${Date.now()}`;
      filteredExpenses.push({
        id: newId,
        description: '',
        volume: '',
        unit: type === 'incidental' ? 'pcs/unit' : '',
        unitPrice: '',
        amount: 0,
        sourceOfFund: type === 'incidental' ? 'Yayasan' : '',
        estimatedWeek: type === 'incidental' ? 'Pekan 1' : '',
      });
    }

    return { ...prev, [expenseKey]: filteredExpenses };
  });
}, []);
```

## 🎯 Hasil yang Diharapkan

1. ✅ RAB baru dimulai dengan hanya 1 baris kosong untuk setiap kategori
2. 🔄 Ketika user mulai mengisi baris terakhir, otomatis ditambah baris baru
3. 🔄 Baris kosong yang tidak perlu akan dihapus otomatis
4. 🔄 Selalu ada minimal 1 baris kosong untuk input baru

## 📝 Status Implementasi

- ✅ **Default Data**: Sudah diubah menjadi 1 baris per kategori
- ✅ **Auto Add Row**: Sudah diimplementasi pada RABPage.tsx
- ✅ **Remove Empty Rows**: Sudah diimplementasi pada RABPage.tsx

## 🔧 File yang Dimodifikasi

### `src/types/rab.ts`
- Mengubah `defaultRABData.routineExpenses` dari 10 item menjadi 1 item kosong
- Mengubah `defaultRABData.incidentalExpenses` dari 7 item menjadi 1 item kosong

### `src/pages/RABPage.tsx`
- **Fungsi `updateExpenseItem`**: Ditambahkan logika auto-add row ketika user mulai mengisi baris terakhir
- **Fungsi `removeExpenseItem`**: Ditambahkan logika untuk memastikan selalu ada minimal 1 baris kosong

## 🎯 Cara Kerja Auto Add Row

1. **Trigger**: Ketika user mulai mengisi field `description`, `volume`, atau `unitPrice` pada baris terakhir
2. **Kondisi**: Sistem mengecek apakah baris tersebut adalah baris terakhir dan belum ada baris kosong di akhir
3. **Action**: Otomatis menambahkan baris baru yang kosong di akhir tabel
4. **Minimum**: Selalu mempertahankan minimal 1 baris kosong untuk input

## 🎉 Hasil Akhir

- ✅ RAB baru dimulai dengan hanya 1 baris kosong untuk setiap kategori (Belanja Rutin & Belanja Insidentil)
- ✅ Ketika user mulai mengisi baris terakhir, otomatis ditambah baris baru
- ✅ Sistem mempertahankan minimal 1 baris kosong untuk input baru
- ✅ UX lebih bersih dan efisien - tidak ada banyak baris kosong yang tidak perlu

---

**Status: ✅ IMPLEMENTASI SELESAI**  
*RAB sekarang menggunakan sistem auto-add row yang lebih efisien dan user-friendly.*