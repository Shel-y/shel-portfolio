const fs = require('fs');
let js = fs.readFileSync('js/i18n.js', 'utf8');

// phone.community.p1
js = js.replace(
    /"phone\.community\.p1": "AWSpectrum LATAM \(Fundadora y Lead\)\\nLa primera comunidad de mujeres enfocada en AWS en Latinoamérica\. Construyendo identidad, equipos y espacios seguros para el talento diverso\.",/g,
    \`"phone.community.p1": "<strong>AWSpectrum LATAM (Fundadora y Lead)</strong><br>La primera comunidad de mujeres enfocada en AWS en Latinoamérica. Construyendo identidad, equipos y espacios seguros para el talento diverso.",\`
);

js = js.replace(
    /"phone\.community\.p1": "AWSpectrum LATAM \(Founder & Lead\)\\nThe first AWS-focused women's community in Latin America\. Building identity, teams, events and safe spaces for diverse talent\.",/g,
    \`"phone.community.p1": "<strong>AWSpectrum LATAM (Founder &amp; Lead)</strong><br>The first AWS-focused women's community in Latin America. Building identity, teams, events and safe spaces for diverse talent.",\`
);

js = js.replace(
    /"phone\.community\.p1": "AWSpectrum LATAM \(Fundadora e Lead\)\\nA primeira comunidade de mulheres focada em AWS na América Latina\. Construindo identidade, equipes e espaços seguros para o talento diverso\.",/g,
    \`"phone.community.p1": "<strong>AWSpectrum LATAM (Fundadora e Lead)</strong><br>A primeira comunidade de mulheres focada em AWS na América Latina. Construindo identidade, equipes e espaços seguros para o talento diverso.",\`
);

// phone.community.p2
js = js.replace(
    /"phone\.community\.p2": "Teaching & Mentorship\\nInstructora de programación para 50\+ estudiantes\. Traduzco conceptos técnicos para audiencias de todos los niveles\. Mentora en AWS Builders y QIntern 2026\.",/g,
    \`"phone.community.p2": "<strong>Teaching &amp; Mentorship</strong><br>Instructora de programación para 50+ estudiantes. Traduzco conceptos técnicos para audiencias de todos los niveles. Mentora en AWS Builders y QIntern 2026.",\`
);

js = js.replace(
    /"phone\.community\.p2": "Teaching & Mentorship\\nProgramming instructor for 50\+ students\. I translate complex technical concepts for all audiences\. Mentor at AWS Builders bootcamp and QIntern 2026\.",/g,
    \`"phone.community.p2": "<strong>Teaching &amp; Mentorship</strong><br>Programming instructor for 50+ students. I translate complex technical concepts for all audiences. Mentor at AWS Builders bootcamp and QIntern 2026.",\`
);

js = js.replace(
    /"phone\.community\.p2": "Ensino e Mentoria\\nInstrutora de programação para 50\+ alunos\. Traduzo conceitos técnicos complexos para todos os níveis\. Mentora no AWS Builders e QIntern 2026\.",/g,
    \`"phone.community.p2": "<strong>Ensino e Mentoria</strong><br>Instrutora de programação para 50+ alunos. Traduzo conceitos técnicos complexos para todos os níveis. Mentora no AWS Builders e QIntern 2026.",\`
);

fs.writeFileSync('js/i18n.js', js);
console.log('Fixed community strings in i18n.js');
