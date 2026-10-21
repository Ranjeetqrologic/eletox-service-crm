const HIDE_COMPLETED_AFTER_DAYS = 1;

export const staffHideOldCompleted = () => {
  const cut = new Date(Date.now() - HIDE_COMPLETED_AFTER_DAYS * 24 * 60 * 60 * 1000);
  return {
    $nor: [
      {
        status: { $in: ["completed", "closed"] },
        $or: [{ completedAt: { $lt: cut } }, { completedAt: { $exists: false }, updatedAt: { $lt: cut } }],
      },
    ],
  };
};
