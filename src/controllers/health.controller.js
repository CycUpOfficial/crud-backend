import { getHealthStatus } from "../services/health.service.js";
import { toHealthResponseDto } from "../dtos/health.dto.js";

export const healthCheck = async (req, res) => {
    const result = await getHealthStatus();
    res.json(toHealthResponseDto(result));
};