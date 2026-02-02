import { getAllCategories } from "../repositories/categories.repository.js";

const buildCategoryTree = (categories) => {
    const nodes = new Map();
    categories.forEach((category) => {
        nodes.set(category.id, { ...category, children: [] });
    });

    const roots = [];
    categories.forEach((category) => {
        const node = nodes.get(category.id);
        if (category.parentId) {
            const parent = nodes.get(category.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    return roots;
};

export const listCategories = async ({ name } = {}) => {
    const categories = await getAllCategories({ name });
    return buildCategoryTree(categories);
};
