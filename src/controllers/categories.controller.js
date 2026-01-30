import { listCategories } from "../services/categories.service.js";
import { toCategoriesResponseDto } from "../dtos/categories.dto.js";

export const getCategories = async (req, res) => {
    const { name } = req.validated?.query ?? {};
    const categories = await listCategories({ name });
    res.json(toCategoriesResponseDto(categories));
};
