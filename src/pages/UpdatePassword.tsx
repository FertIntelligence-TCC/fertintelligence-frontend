import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";
import { updateUser } from "@/services/userService";
import { useUserStore } from "@/stores/user/user.store";
import { UpdateUserPayload } from "@/interfaces/ServicePayload";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const handleConfirm = async (password: string, repeatPassword: string) => {
    if (password !== repeatPassword) {
      throw new Error("As senhas não coincidem.");
    }

    const payload: UpdateUserPayload = {
      nova_password: password
    };

    await updateUser(payload);
    alert("Senha alterada com sucesso!");
    navigate("/fertintelligence/home");
  };

  const handleCancel = () => {
    navigate("/fertintelligence/home");
  };

  return (
    <PasswordVerification
      subtitle="Mudar senha"
      cardHeading="Digite sua nova senha"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      isNewPassword={true}
    />
  );
}