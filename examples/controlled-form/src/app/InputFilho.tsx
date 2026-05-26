type InputFilhoProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function InputFilho({ label, value, onChange, error }: InputFilhoProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '4px' }}>{label}</label>
      <input
        type="text"
        value={value} // Controlado pelo pai
        onChange={(e) => onChange(e.target.value)} // Avisa o pai
        style={{
          padding: '8px',
          border: error? '2px solid red' : '1px solid #ccc',
          borderRadius: '4px',
          width: '300px'
        }}
      />
      {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
    </div>
  );
}