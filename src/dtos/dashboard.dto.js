export const buildDashboardAnalyticsDto = ({
                                               totalPosted,
                                               totalSold,
                                               totalGivenAway,
                                               totalRented,
                                               activeItems
                                           }) => ({
    totalPosted,
    totalSold,
    totalGivenAway,
    totalRented,
    activeItems
});

export const buildDashboardItemsDto = ({ items, pagination }) => ({
    items,
    pagination
});

export const buildDashboardRatingsDto = ({
                                             overallRating,
                                             totalRatings,
                                             ratings
                                         }) => ({
    overallRating,
    totalRatings,
    ratings
});