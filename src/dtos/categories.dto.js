const toCategoryDto = (category) => {
    const dto = {
        id: category.id,
        name: category.name
    };

    if (category.children?.length) {
        dto.children = category.children.map(toCategoryDto);
    }

    return dto;
};

export const toCategoriesResponseDto = (categories) => ({
    categories: categories.map(toCategoryDto)
});
