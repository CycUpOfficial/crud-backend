import { registerUser } from "../services/auth.service.js";
import { toRegisterResponseDto } from "../dtos/auth.dto.js";

export const register = async (req, res) => {
    const { email } = req.validated.body;
    const result = await registerUser(email);
    res.status(201).json(toRegisterResponseDto(result));
};