'use client';
import { useState } from 'react';
import { InputFilho } from './InputFilho';

export function FormularioPai() {
  // Single Source of Truth: todo estado fica aqui
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');

  const validarEmail = (valor: string) => {
    if (!valor.includes('@')) {
      setErro('E-mail inválido');
      return false;
    }
    setErro('');
    return true;
  };

  const handleChangeEmail = (valor: string) => {
    setEmail(valor);
    validarEmail(valor); 
  };

  const handleSubmit = () => {
    if (validarEmail(email)) {
      alert(`E-mail válido enviado: ${email}`);
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Exemplo: Componente Controlado</h2>
      <p>Digite um e-mail sem @ para ver a validação do pai refletir no filho</p>

      <InputFilho
        label="E-mail"
        value={email}
        onChange={handleChangeEmail}
        error={erro}
      />

      <button
        onClick={handleSubmit}
        style={{ padding: '8px 16px', marginTop: '8px' }}
      >
        Enviar
      </button>
    </div>
  );
}