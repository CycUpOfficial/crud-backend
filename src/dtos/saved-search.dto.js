export const toCreateSavedSearchResponseDto = (savedSearch) => ({
    id: savedSearch.id,
    searchTerms: savedSearch.terms.map(t => t.searchTerm),
    email: savedSearch.emailEnabled,
    in_app: savedSearch.inAppEnabled,
    createdAt: savedSearch.createdAt
});

export const toSavedSearchDto = (savedSearch) => ({
    id: savedSearch.id,
    searchTerms: savedSearch.terms.map(t => t.searchTerm),
    email: savedSearch.emailEnabled,
    in_app: savedSearch.inAppEnabled,
    createdAt: savedSearch.createdAt
});

export const toSavedSearchResponseDto = (savedSearch) => ({
    id: savedSearch.id,
    searchTerms: savedSearch.terms.map(t => t.searchTerm),
    email: savedSearch.emailEnabled,
    in_app: savedSearch.inAppEnabled,
    createdAt: savedSearch.createdAt
});
