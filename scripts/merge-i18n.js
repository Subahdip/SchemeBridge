const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../public/locales/en/translation.json');
const hiPath = path.join(__dirname, '../public/locales/hi/translation.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

const newTranslations = {
  "Application submitted and received by the channel lending partner.": {
    en: "Application submitted and received by the channel lending partner.",
    hi: "आवेदन जमा किया गया और चैनल ऋण भागीदार द्वारा प्राप्त हुआ।"
  },
  "Branch officer verifies applicant caste certificate, project feasibility, and income.": {
    en: "Branch officer verifies applicant caste certificate, project feasibility, and income.",
    hi: "शाखा अधिकारी आवेदक के जाति प्रमाण पत्र, परियोजना व्यवहार्यता और आय का सत्यापन करता है।"
  },
  "Formal sanction letter issued under National Concessional Scheme guidelines.": {
    en: "Formal sanction letter issued under National Concessional Scheme guidelines.",
    hi: "राष्ट्रीय रियायती योजना दिशानिर्देशों के तहत औपचारिक स्वीकृति पत्र जारी किया गया।"
  },
  "Direct benefit transfer of 90% loan amount to beneficiary savings account.": {
    en: "Direct benefit transfer of 90% loan amount to beneficiary savings account.",
    hi: "लाभार्थी बचत खाते में 90% ऋण राशि का प्रत्यक्ष लाभ अंतरण (DBT)।"
  },
  "State Bank of India (MSME & Concessional Lending Hub)": {
    en: "State Bank of India (MSME & Concessional Lending Hub)",
    hi: "भारतीय स्टेट बैंक (एमएसएमई एवं रियायती ऋण केंद्र)"
  },
  "Verified zero-collateral desk • Ambedkar Bhawan / Lead Bank Office": {
    en: "Verified zero-collateral desk • Ambedkar Bhawan / Lead Bank Office",
    hi: "सत्यापित शून्य-संपार्श्विक डेस्क • अंबेडकर भवन / अग्रणी बैंक कार्यालय"
  },
  "Next:": {
    en: "Next:",
    hi: "अगला:"
  },
  "EMI Calculator": {
    en: "EMI Calculator",
    hi: "ईएमआई कैलकुलेटर"
  },
  "Quick Jump:": {
    en: "Quick Jump:",
    hi: "त्वरित नेविगेशन:"
  },
  "Partner Network": {
    en: "Partner Network",
    hi: "पार्टनर नेटवर्क"
  },
  "Up to ₹50,00,000": {
    en: "Up to ₹50,00,000",
    hi: "₹50,00,000 तक"
  },
  "Primary Loan Purpose": {
    en: "Primary Loan Purpose",
    hi: "प्राथमिक ऋण उद्देश्य"
  },
  "Business Scale / Target Activity": {
    en: "Business Scale / Target Activity",
    hi: "व्यवसाय का पैमाना / लक्षित गतिविधि"
  },
  "Course Level / Degree Type": {
    en: "Course Level / Degree Type",
    hi: "पाठ्यक्रम स्तर / डिग्री प्रकार"
  },
  "Government concessional loan programs mandate an annual family income threshold of ₹5,00,000. Eligible applicants receive up to 90% project cost coverage with only 10% self-contribution margin.": {
    en: "Government concessional loan programs mandate an annual family income threshold of ₹5,00,000. Eligible applicants receive up to 90% project cost coverage with only 10% self-contribution margin.",
    hi: "सरकारी रियायती ऋण कार्यक्रमों के लिए ₹5,00,000 की वार्षिक पारिवारिक आय सीमा अनिवार्य है। पात्र आवेदकों को केवल 10% स्वयं के योगदान के साथ 90% तक परियोजना लागत कवरेज प्राप्त होता है।"
  },
  "Please complete assessment first": {
    en: "Please complete assessment first",
    hi: "कृपया पहले मूल्यांकन पूरा करें"
  },
  "No active scheme matching session was found. Complete your initial eligibility assessment to get tailored government loan schemes, auto-filled 90% loan amounts, and subsidized interest rates.": {
    en: "No active scheme matching session was found. Complete your initial eligibility assessment to get tailored government loan schemes, auto-filled 90% loan amounts, and subsidized interest rates.",
    hi: "कोई सक्रिय योजना मिलान सत्र नहीं मिला। अनुकूलित सरकारी ऋण योजनाएं, स्वतः भरी गई 90% ऋण राशि और रियायती ब्याज दरें प्राप्त करने के लिए अपना प्रारंभिक पात्रता मूल्यांकन पूरा करें।"
  },
  "Interactive Scheme EMI Calculator": {
    en: "Interactive Scheme EMI Calculator",
    hi: "इंटरएक्टिव योजना ईएमआई कैलकुलेटर"
  },
  "Are you sure you want to remove application": {
    en: "Are you sure you want to remove application",
    hi: "क्या आप वाकई इस आवेदन को हटाना चाहते हैं"
  },
  "Government Concessional Credit Portal": {
    en: "Government Concessional Credit Portal",
    hi: "सरकारी रियायती ऋण पोर्टल"
  },
  "Loading applications...": {
    en: "Loading applications...",
    hi: "आवेदन लोड हो रहे हैं..."
  },
  "Search by ID or Scheme...": {
    en: "Search by ID or Scheme...",
    hi: "आईडी या योजना से खोजें..."
  },
  "All": {
    en: "All",
    hi: "सभी"
  },
  "No applications match the selected filter.": {
    en: "No applications match the selected filter.",
    hi: "चयनित फ़िल्टर से कोई आवेदन मेल नहीं खाता।"
  },
  "Delete application record": {
    en: "Delete application record",
    hi: "आवेदन रिकॉर्ड हटाएं"
  },
  "Step": {
    en: "Step",
    hi: "चरण"
  },
  "Direct Lending Security Guarantee": {
    en: "Direct Lending Security Guarantee",
    hi: "प्रत्यक्ष ऋण सुरक्षा गारंटी"
  },
  "Applications are dispatched to Ministry of Social Justice & Empowerment verified partner banks.": {
    en: "Applications are dispatched to Ministry of Social Justice & Empowerment verified partner banks.",
    hi: "आवेदन सामाजिक न्याय एवं अधिकारिता मंत्रालय द्वारा सत्यापित भागीदार बैंकों को भेजे जाते हैं।"
  },
  "Regular Interest": {
    en: "Regular Interest",
    hi: "नियमित ब्याज"
  },
  "Moratorium Interest": {
    en: "Moratorium Interest",
    hi: "अधिस्थगन (मोरेटोरियम) ब्याज"
  },
  "of total repayment": {
    en: "of total repayment",
    hi: "कुल पुनर्भुगतान का"
  },
  "Min": {
    en: "Min",
    hi: "न्यूनतम"
  },
  "Max": {
    en: "Max",
    hi: "अधिकतम"
  },
  "Annual Interest Rate (% p.a.)": {
    en: "Annual Interest Rate (% p.a.)",
    hi: "वार्षिक ब्याज दर (% प्रति वर्ष)"
  },
  "Subsidized: 4.0%": {
    en: "Subsidized: 4.0%",
    hi: "रियायती: 4.0%"
  },
  "Standard: 7.5%": {
    en: "Standard: 7.5%",
    hi: "मानक: 7.5%"
  },
  "Commercial: 12.0%": {
    en: "Commercial: 12.0%",
    hi: "व्यावसायिक: 12.0%"
  },
  "Repayment Tenure (1 to 10 Years)": {
    en: "Repayment Tenure (1 to 10 Years)",
    hi: "पुनर्भुगतान अवधि (1 से 10 वर्ष)"
  },
  "Years": {
    en: "Years",
    hi: "वर्ष"
  },
  "Months": {
    en: "Months",
    hi: "महीने"
  },
  "Moratorium Grace Period": {
    en: "Moratorium Grace Period",
    hi: "मोरेटोरियम ग्रेस अवधि"
  },
  "During education moratorium, no EMI is paid. Simple interest is accrued over the grace period.": {
    en: "During education moratorium, no EMI is paid. Simple interest is accrued over the grace period.",
    hi: "शिक्षा अधिस्थगन के दौरान कोई ईएमआई नहीं चुकाई जाती। ग्रेस अवधि में केवल साधारण ब्याज जुड़ता है।"
  },
  "Moratorium Duration:": {
    en: "Moratorium Duration:",
    hi: "मोरेटोरियम अवधि:"
  },
  "Accrued Moratorium Interest:": {
    en: "Accrued Moratorium Interest:",
    hi: "संचित मोरेटोरियम ब्याज:"
  },
  "Monthly Installment (EMI)": {
    en: "Monthly Installment (EMI)",
    hi: "मासिक किस्त (ईएमआई)"
  },
  "Installments": {
    en: "Installments",
    hi: "किस्तें"
  },
  "month": {
    en: "month",
    hi: "माह"
  },
  "of total": {
    en: "of total",
    hi: "कुल का"
  },
  "Total Repayment": {
    en: "Total Repayment",
    hi: "कुल पुनर्भुगतान"
  },
  "Principal + Interest": {
    en: "Principal + Interest",
    hi: "मूलधन + ब्याज"
  },
  "Total": {
    en: "Total",
    hi: "कुल"
  },
  "For every ₹100 repaid, approximately ₹{{principal}} pays the principal and ₹{{interest}} covers interest.": {
    en: "For every ₹100 repaid, approximately ₹{{principal}} pays the principal and ₹{{interest}} covers interest.",
    hi: "प्रत्येक ₹100 के पुनर्भुगतान पर लगभग ₹{{principal}} मूलधन और ₹{{interest}} ब्याज में जाता है।"
  },
  "Standard Reducing Balance Method (National Portal Standard)": {
    en: "Standard Reducing Balance Method (National Portal Standard)",
    hi: "मानक घटती शेष विधि (राष्ट्रीय पोर्टल मानक)"
  },
  "Approved Channel Partner Network": {
    en: "Approved Channel Partner Network",
    hi: "स्वीकृत चैनल पार्टनर नेटवर्क"
  },
  "Select your business project scale based on estimated capital requirement:": {
    en: "Select your business project scale based on estimated capital requirement:",
    hi: "अनुमानित पूंजी आवश्यकता के आधार पर अपने व्यवसाय परियोजना के पैमाने का चयन करें:"
  },
  "Micro Finance Scheme: Interest 6.5%, Max Loan ₹1.40L, 90% Coverage.": {
    en: "Micro Finance Scheme: Interest 6.5%, Max Loan ₹1.40L, 90% Coverage.",
    hi: "माइक्रो फाइनेंस योजना: ब्याज 6.5%, अधिकतम ऋण ₹1.40 लाख, 90% कवरेज।"
  },
  "Term Loan Scheme: Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.": {
    en: "Term Loan Scheme: Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.",
    hi: "टर्म लोन योजना: ब्याज 7.5%, अधिकतम ऋण ₹50.00 लाख, 90% कवरेज।"
  },
  "Term Loan Scheme (Large): Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.": {
    en: "Term Loan Scheme (Large): Interest 7.5%, Max Loan ₹50.00L, 90% Coverage.",
    hi: "टर्म लोन योजना (बड़ा पैमाना): ब्याज 7.5%, अधिकतम ऋण ₹50.00 लाख, 90% कवरेज।"
  },
  "Select your current or planned academic level:": {
    en: "Select your current or planned academic level:",
    hi: "अपने वर्तमान या नियोजित शैक्षणिक स्तर का चयन करें:"
  },
  "Education Loan Scheme: Interest 6.5%, Govt Coverage 90%, Moratorium Available during studies.": {
    en: "Education Loan Scheme: Interest 6.5%, Govt Coverage 90%, Moratorium Available during studies.",
    hi: "शिक्षा ऋण योजना: ब्याज 6.5%, सरकारी कवरेज 90%, अध्ययन के दौरान मोरेटोरियम उपलब्ध।"
  },
  "Why did this happen?": {
    en: "Why did this happen?",
    hi: "ऐसा क्यों हुआ?"
  },
  "Calculate EMI": {
    en: "Calculate EMI",
    hi: "ईएमआई की गणना करें"
  },
  "Ready to Apply for {{scheme}}?": {
    en: "Ready to Apply for {{scheme}}?",
    hi: "{{scheme}} के लिए आवेदन करने के लिए तैयार हैं?"
  },
  "National Concessional Term Loan Scheme": {
    en: "National Concessional Term Loan Scheme",
    hi: "राष्ट्रीय रियायती सावधि ऋण योजना"
  },
  "Subsidized Education Loan Scheme": {
    en: "Subsidized Education Loan Scheme",
    hi: "रियायती शिक्षा ऋण योजना"
  },
  "Male": {
    en: "Male",
    hi: "पुरुष"
  },
  "Female": {
    en: "Female",
    hi: "महिला"
  },
  "Other": {
    en: "Other",
    hi: "अन्य"
  },
  "Inactive": {
    en: "Inactive",
    hi: "निष्क्रिय"
  },
  "All States": {
    en: "All States",
    hi: "सभी राज्य"
  },
  "All Schemes": {
    en: "All Schemes",
    hi: "सभी योजनाएं"
  }
};

Object.entries(newTranslations).forEach(([k, v]) => {
  en[k] = v.en;
  hi[k] = v.hi;
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2), 'utf8');
console.log('Successfully updated en and hi translation JSON files!');
