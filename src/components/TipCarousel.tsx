import { useState, useEffect } from 'react';

const tips = [
  "Mantenha o pH entre 6.0 e 6.5 no solo para otimizar a absorção de nutrientes.",
  "Na fase vegetativa, as plantas preferem umidade relativa do ar entre 40% e 60%.",
  "O treinamento de baixo estresse (LST) aumenta o rendimento expondo mais ramos à luz.",
  "Faça o flush (rega apenas com água) 1-2 semanas antes da colheita para melhorar o sabor.",
  "Monitore os tricomas com uma lupa: transparentes indicam imaturidade, latescentes é o pico, e ambar significa pico de maturidade e efeito corporal.",
  "A temperatura ideal na floração com luzes acesas repousa confortavelmente entre 20°C e 26°C.",
  "Evite regar demais: deixe o topo do solo secar levemente antes da próxima rega previnindo root rot.",
  "Boa ventilação previne fungos, evita oídio e fortalece dramaticamente os caules das plantas na fase inicial."
];

export const TipCarousel = () => {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 8000); // 8 segundos de rotação
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tip-card">
      <span className="tip-badge">💡 Tip</span>
      <span 
        key={currentTip} 
        className="tip-text" 
        style={{ 
          animation: 'fadeInSlide 1s ease forwards',
          display: 'inline-block' 
        }}
      >
        {tips[currentTip]}
        <style>{`
          @keyframes fadeInSlide {
            0% { opacity: 0; transform: translateY(4px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </span>
    </div>
  );
};
