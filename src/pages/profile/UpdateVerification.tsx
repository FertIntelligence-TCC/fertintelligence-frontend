// pages/UpdateVerification.tsx
import { useNavigate } from "react-router-dom";
import PasswordVerification from "./PasswordVerification";
import { useUserStore } from "../../stores/user/user.store";
import { updateUser } from "@/services/userService";

import type { User } from "../../interfaces/Models";
import type {
  UpdateUserPayload,
  DataNasc,
  Telefone,
  Genero,
  Formacao,
} from "../../interfaces/User";

const UPDATE_PROFILE_DATA_KEY = "fertintelligence_update_profile_data";

// Normaliza o objeto vindo do sessionStorage para o "shape" unificado do cadastro
function normalizeFromSession(parsed: any) {
  // Caso novo: salvamos { payload: { name, username, email, cpf, datanasc, telefone, genero, formacao, profissao, cargo, foto } }
  if (parsed?.payload) {
    const p = parsed.payload;
    return {
      name: String(p.name ?? ""),
      username: String(p.username ?? ""),
      email: String(p.email ?? ""),
      cpf: String(p.cpf ?? ""),
      datanasc: p.datanasc as DataNasc, // { dia, mes, ano }
      telefone: p.telefone as Telefone, // { pais, ddd, numero }
      genero: p.genero as keyof typeof Genero,
      formacao: p.formacao as keyof typeof Formacao,
      profissao: String(p.profissao ?? ""),
      foto: String(p.idfoto ?? p.foto ?? ""),
    };
  }

  // Legado: chaves novo_* usadas anteriormente na página de UpdateProfile
  // Mapeamos para o shape unificado
  return {
    name: String(parsed.novo_name ?? parsed.novo_nome ?? ""),
    username: String(parsed.novo_username ?? parsed.novo_login ?? ""),
    email: String(parsed.novo_email ?? ""),
    cpf: String(parsed.novo_cpf ?? ""),
    datanasc: (parsed.nova_datanasc ?? parsed.nova_age) as DataNasc, // suporte a "nova_age" legado (evite, mas mantém compat)
    telefone: parsed.novo_telefone as Telefone,
    genero: parsed.novo_genero as keyof typeof Genero,
    formacao: parsed.nova_formacao as keyof typeof Formacao,
    profissao: String(parsed.nova_profissao ?? ""),
    foto: String(parsed.novo_idfoto ?? parsed.id_nova_foto ?? parsed.nova_foto ?? ""),
  };
}

export default function UpdateVerification() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const currentUser = useUserStore((s) => s.user) as User | null;

  const handleConfirm = async (password: string) => {
    // 1) Recupera e limpa os dados temporários
    const raw = sessionStorage.getItem(UPDATE_PROFILE_DATA_KEY);
    sessionStorage.removeItem(UPDATE_PROFILE_DATA_KEY);

    if (!raw) {
      alert("Erro de dados: Dados de perfil não encontrados. Tente novamente.");
      navigate("/fertintelligence/update-profile");
      throw new Error("Dados de perfil não encontrados.");
    }

    // 2) Normaliza para o shape unificado
    const parsed = JSON.parse(raw);
    const unified = normalizeFromSession(parsed);

    // 3) Monta o payload de atualização (todos os campos do cadastro)
    // Mantemos prefixos 'novo_' para compatibilidade com o backend existente.
    const payload: UpdateUserPayload = {
      novo_name: unified.name,
      novo_username: unified.username,
      novo_email: unified.email,
      novo_cpf: unified.cpf,
      nova_datanasc: unified.datanasc,   // DataNasc
      novo_telefone: unified.telefone,   // Telefone
      novo_genero: unified.genero,       // keyof typeof Genero
      nova_formacao: unified.formacao,   // keyof typeof Formacao
      nova_profissao: unified.profissao,
      novo_idfoto: unified.foto,           
      nova_senha: password,              // senha atual para validação no backend
    } as UpdateUserPayload;

    try {
      // 4) Chama o serviço real
      await updateUser(payload);

      // 5) Feedback
      alert("Perfil atualizado com sucesso!");

      // 6) Atualiza store local (mantendo campos existentes no tipo User)
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          // nomes podem variar conforme seu backend; ajuste se seu `User` tiver outros nomes
          name: unified.name ?? (currentUser as any).name,
          login: unified.username ?? currentUser.login,
          email: unified.email ?? currentUser.email,
          cpf: unified.cpf ?? (currentUser as any).cpf,
          datanasc: unified.datanasc ?? (currentUser as any).datanasc,
          telefone: unified.telefone ?? (currentUser as any).telefone,
          genero: (unified.genero as any) ?? (currentUser as any).genero,
          formacao: (unified.formacao as any) ?? (currentUser as any).formacao,
          profissao: unified.profissao ?? (currentUser as any).profissao,
          // Mantemos compat com id_foto legado
          idfoto: unified.foto ?? (currentUser as any).id_foto,
          // Caso seu `User` possua um campo `foto`, também setamos:
          ...(typeof (currentUser as any).foto !== "undefined"
            ? { foto: unified.foto }
            : {}),
        };
        setUser(updatedUser);
      }

      // 7) Redireciona
      navigate("/fertintelligence/home");
    } catch (err) {
      console.error("Erro na atualização do perfil:", err);
      // re-lança para o PasswordVerification capturar
      throw err;
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem(UPDATE_PROFILE_DATA_KEY);
    navigate("/fertintelligence/home");
  };

  return (
    <PasswordVerification
      subtitle="Confirme as mudanças no perfil"
      cardHeading="Digite sua senha atual para confirmar as mudanças no perfil"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
