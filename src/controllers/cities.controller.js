import { listCities } from "../services/cities.service.js";
import { toCitiesResponseDto } from "../dtos/cities.dto.js";

export const getCities = async (req, res) => {
    const { name } = req.validated?.query ?? {};
    const cities = await listCities({ name });

    res.json(toCitiesResponseDto(cities));
};
