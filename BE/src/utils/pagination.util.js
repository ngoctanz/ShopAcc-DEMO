export const paginationUtils = {
  getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  },

  createPaginationMeta(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrevious,
    };
  },
};
