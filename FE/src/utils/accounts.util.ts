export interface FilterOption {
  label: string;
  value: string;
}

export const getFilterOptions = () => {
  return {
    sortOptions: [
      { label: 'Mặc định', value: 'default' },
      { label: 'Giá thấp đến cao', value: 'price_asc' },
      { label: 'Giá cao đến thấp', value: 'price_desc' },
    ],
    priceFilterOptions: [
      { label: 'Tất cả mức giá', value: 'all' },
      { label: 'Dưới 100k', value: '0-100k' },
      { label: '100k - 500k', value: '100k-500k' },
      { label: 'Trên 500k', value: '500k-plus' },
    ],
  };
};
