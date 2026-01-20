import { registerUser, verifyUser } from "../services/auth.service.js";
import { toRegisterResponseDto, toVerifyResponseDto } from "../dtos/auth.dto.js";

export const register = async (req, res) => {
    const { email } = req.validated.body;
    const result = await registerUser(email);
    res.status(201).json(toRegisterResponseDto(result));
};

export const verify = async (req, res) => {
    const { email, pinCode, password, passwordConfirmation } = req.validated.body;
    const result = await verifyUser({ email, pinCode, password, passwordConfirmation });
    res.status(200).json(toVerifyResponseDto(result));
};