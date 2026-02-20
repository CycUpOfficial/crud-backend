import { getAllCities } from "../repositories/cities.repository.js";

export const listCities = async ({ name } = {}) => getAllCities({ name });
