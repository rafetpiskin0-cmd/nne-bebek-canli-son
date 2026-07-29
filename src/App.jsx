import React, { useState, useEffect, useMemo, useRef } from "react";
import { callGemini } from "./services/geminiService.js";
import { signInWithGoogle, signInWithApple, registerWithEmail, signInWithEmail, resetPassword, watchAuthState, signOutUser, handleRedirectResult } from "./services/auth.js";
import {
  Heart, Baby, Brain, Sparkles, Sun, Moon, Droplet, Pill, Dumbbell,
  Stethoscope, Smile, ChevronLeft, ChevronRight, ChevronDown, Check, X,
  Plus, Camera, Mic, Send, Play, Pause, Timer, Star, Award, Bell,
  ShoppingBag, BookOpen, Music2, Ruler, Weight, Syringe, Utensils,
  Moon as MoonIcon, Droplets, Wind, CloudRain, Waves, TreePine, Flame,
  Train, Car, User, Users, Settings, Crown, Lock, ArrowRight, Home,
  Activity, CalendarDays, MessageCircle, Menu, Edit3, LogOut, Mail,
  Apple as AppleIcon, MapPin, Clock, TrendingUp, AlertCircle, Info
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

    .abp-root {
      --white: #FFFFFF;
      --pink: #FDE3EC;
      --pink-deep: #F6B8CE;
      --blue: #E0F0FB;
      --blue-deep: #AEDCF4;
      --purple: #ECE6FB;
      --purple-deep: #C6B3F0;
      --green: #E4F6EA;
      --green-deep: #A9E0BE;
      --ink: #362F4D;
      --ink-soft: #736C87;
      --ink-faint: #A79FBD;
      --card: #FFFFFF;
      --bg: linear-gradient(180deg, #FFF7FA 0%, #F7F5FC 45%, #F2FAF6 100%);
      --shadow: 0 10px 30px -12px rgba(90, 70, 130, 0.18);
      --shadow-sm: 0 4px 14px -6px rgba(90, 70, 130, 0.14);
      --radius-xl: 28px;
      --radius-lg: 22px;
      --radius-md: 16px;
      --radius-sm: 12px;
      font-family: 'Inter', sans-serif;
      color: var(--ink);
      -webkit-font-smoothing: antialiased;
    }
    .abp-root.dark {
      --white: #211C33;
      --pink: #3A2A3B;
      --pink-deep: #5A3B50;
      --blue: #212B3E;
      --blue-deep: #2E3F58;
      --purple: #2B2540;
      --purple-deep: #453A66;
      --green: #1E3128;
      --green-deep: #2C4A38;
      --ink: #F2EFFA;
      --ink-soft: #B7AFD1;
      --ink-faint: #7B7295;
      --card: #26213A;
      --bg: linear-gradient(180deg, #17131F 0%, #191527 45%, #141C1A 100%);
      --shadow: 0 10px 30px -12px rgba(0,0,0,0.45);
      --shadow-sm: 0 4px 14px -6px rgba(0,0,0,0.4);
    }
    .abp-root * { box-sizing: border-box; }
    .abp-display { font-family: 'Plus Jakarta Sans', sans-serif; }
    .abp-scrollbar::-webkit-scrollbar { display: none; }
    .abp-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .abp-tap { transition: transform .15s ease, opacity .15s ease; cursor: pointer; }
    .abp-tap:active { transform: scale(0.96); opacity: 0.85; }
    @keyframes abp-fade-up { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform:translateY(0);} }
    .abp-fade-up { animation: abp-fade-up .45s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes abp-pop { 0%{transform:scale(.9);opacity:0;} 100%{transform:scale(1);opacity:1;} }
    .abp-pop { animation: abp-pop .35s cubic-bezier(.34,1.4,.64,1) both; }
    @keyframes abp-spin-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
    @keyframes abp-heartbeat { 0%,100%{transform:scale(1);opacity:.85;} 30%{transform:scale(1.35);opacity:1;} 60%{transform:scale(0.95);opacity:.7;} }
    .abp-heartbeat { transform-origin: center; transform-box: fill-box; animation: abp-heartbeat 1.1s ease-in-out infinite; }
    @keyframes abp-shimmer { 0%{background-position:100% 0;} 100%{background-position:0 0;} }
    @keyframes abp-typing { 0%,60%,100%{transform:translateY(0);opacity:.4;} 30%{transform:translateY(-4px);opacity:1;} }
    .abp-typing-dot { animation: abp-typing 1.1s ease-in-out infinite; }
  `}</style>
);

/* ============================================================
   SAMPLE DATA
   ============================================================ */
const FRUITS = ["Haşhaş tohumu","Susam tohumu","Yaban mersini","Ahududu","Zeytin","Erik","Limon","Nektarin","Avokado","Turp","Havuç","Kabak","Enginar","Soğan","Nar","Salatalık","Muz","Domates","Mango","Muz","Havuç","Papaya","Kabak","Marul","Ananas","Kavun","Kabak","Patlıcan","Balkabağı","Lahana","Salatalık","Kabak","Pırasa","Karnabahar","Marul","Kavun","Karpuz","Pırasa","Kabak","Karpuz"];
const PREGNANCY_WEEKS = Array.from({length:40}, (_,i)=>{
  const week = i+1;
  return {
    week,
    fruit: FRUITS[i],
    length: week<8?`${(week*0.4).toFixed(1)} cm`: week<20?`${(week*1.1).toFixed(0)} cm`:`${(week*1.6).toFixed(0)} cm`,
    weight: week<12?`${Math.max(1,(week*1.2)).toFixed(0)} g`: week<28?`${(week*35).toFixed(0)} g`:`${(week*105).toFixed(0)} g`,
    babyDev: [
      "Kalp atışları belirginleşiyor, temel organ taslakları oluşuyor.",
      "Parmak uçları ve yüz hatları netleşmeye başlıyor.",
      "Beyin hücreleri hızla çoğalıyor, refleksler gelişiyor.",
      "Kemikler sertleşiyor, işitme sistemi olgunlaşıyor.",
      "Akciğerler solunuma hazırlanıyor, göz kırpma refleksi gelişiyor.",
      "Deri altı yağ tabakası kalınlaşıyor, uyku-uyanıklık döngüsü belirginleşiyor.",
      "Bağışıklık sistemi güçleniyor, doğuma hazırlık başlıyor."
    ][i % 7],
    momChanges: [
      "Hafif yorgunluk ve koku hassasiyeti görülebilir.",
      "Bulantı en yoğun döneminde olabilir, sık ve az beslenmek yardımcı olur.",
      "Enerji artışı ve iştah değişimleri görülebilir.",
      "Karın belirginleşmeye başlar, bel çevresinde genişleme hissedilir.",
      "Bebek hareketleri daha net hissedilir.",
      "Bel ve sırt ağrısı artabilir, duruşa dikkat önemlidir.",
      "Nefes darlığı ve şişkinlik hissi artabilir."
    ][i % 7],
    dos: "Bol su için, düzenli kontrol randevularınızı aksatmayın, hafif tempolu yürüyüş yapın.",
    donts: "Alkol, sigara ve pastörize edilmemiş süt ürünlerinden kaçının.",
    doctor: "Bu hafta rutin kontrolünüzde tansiyon ve kilo takibi yapılması önerilir.",
    tip: "Gün içinde 10 dakika sessizce nefes egzersizi yapmak stresi azaltabilir."
  };
});

const CHILD_MILESTONES = [
  {month:0, motor:"Refleksler baskın, başını kısa süreli tutmaya çalışır.", language:"Ağlayarak iletişim kurar.", brain:"Ses ve ışığa tepki verir."},
  {month:1, motor:"Yüzüstü pozisyonda başını hafifçe kaldırır.", language:"Farklı ağlama tonları gelişir.", brain:"Yüzleri takip etmeye başlar."},
  {month:2, motor:"Boyun kontrolü güçlenir.", language:"İlk gülümsemeler görülür.", brain:"Sesli uyaranlara yönelir."},
  {month:3, motor:"Elini ağzına götürür, nesnelere uzanır.", language:"Gıgıldama sesleri çıkarır.", brain:"Nedensellik farkındalığı başlar."},
  {month:4, motor:"Desteksiz başını dik tutar.", language:"Kahkaha atar.", brain:"Renk ve şekillere ilgi artar."},
  {month:5, motor:"Desteklendiğinde oturabilir.", language:"Hece benzeri sesler çıkarır.", brain:"Nesne sürekliliği gelişmeye başlar."},
  {month:6, motor:"Desteksiz oturmaya başlar.", language:"'ba-ba', 'da-da' gibi heceler.", brain:"Tanıdık yüzleri ayırt eder."},
  {month:7, motor:"Emekleme denemeleri başlar.", language:"Kendi adına tepki verir.", brain:"Basit oyunları anlar (ce-e)."},
  {month:8, motor:"Tutunarak ayağa kalkmaya çalışır.", language:"'Hayır' kelimesini anlar.", brain:"Nesne kalıcılığı netleşir."},
  {month:9, motor:"Emekler, mobilyaya tutunarak yürür.", language:"Basit jestleri taklit eder.", brain:"Neden-sonuç oyunlarından keyif alır."},
  {month:10, motor:"Tutunarak yan yan yürür.", language:"El sallama gibi jestler kullanır.", brain:"Basit talimatları anlamaya başlar."},
  {month:11, motor:"Desteksiz birkaç saniye durabilir.", language:"İlk anlamlı kelimeye yaklaşır.", brain:"Taklit yoluyla öğrenme artar."},
  {month:12, motor:"İlk bağımsız adımlar atılabilir.", language:"1-3 kelime söyleyebilir.", brain:"Basit problem çözme davranışları görülür."},
  {month:15, motor:"Bağımsız yürür, merdiven çıkmaya çalışır.", language:"5-10 kelime kullanır.", brain:"Sembolik oyun başlar (bebek besleme gibi)."},
  {month:18, motor:"Koşmaya çalışır, kaşık kullanır.", language:"20+ kelime, basit istekler.", brain:"Ayna karşısında kendini tanır."},
  {month:21, motor:"Topa vurur, merdiven iner.", language:"2 kelimelik cümleler kurar.", brain:"Duygularını isimlendirmeye başlar."},
  {month:24, motor:"Zıplar, kalem tutar.", language:"50+ kelime, kısa cümleler.", brain:"Paralel oyun oynar."},
  {month:30, motor:"Tek ayak üstünde durmayı dener.", language:"3-4 kelimelik cümleler.", brain:"Renk ve şekil eşleştirir."},
  {month:36, motor:"Üç tekerlekli bisiklete biner.", language:"Sorular sormaya başlar (neden, nasıl).", brain:"Basit kurallı oyunları anlar."},
  {month:42, motor:"Tek ayak üstünde zıplar.", language:"Hikaye anlatmaya başlar.", brain:"Hayal gücü oyunları artar."},
  {month:48, motor:"Makası kullanmayı dener.", language:"Karmaşık cümleler kurar.", brain:"Sayı ve harfleri tanımaya başlar."},
  {month:54, motor:"Denge gerektiren hareketleri yapar.", language:"Geniş kelime dağarcığı.", brain:"Arkadaşlık kavramı gelişir."},
  {month:60, motor:"İp atlar, topu yakalar.", language:"Akıcı konuşma.", brain:"Kurallı grup oyunlarına katılır."},
  {month:66, motor:"İnce motor beceriler gelişir (yazı).", language:"Detaylı hikayeler anlatır.", brain:"Okul öncesi kavramlara hazırdır."},
  {month:72, motor:"Koordinasyon büyük ölçüde olgunlaşır.", language:"Akranlarıyla karmaşık diyaloglar kurar.", brain:"Okula hazır bilişsel düzeye ulaşır."}
];

/* ============================================================
   GÜN GÜN İÇERİK — "1. gün, 2. gün, 3. gün..." anlatımı
   Hamilelik günleri son adet tarihinden (SAT) itibaren sayılır — tüm
   hamilelik uygulamalarının kullandığı standart yöntem budur. Bu yüzden
   1-13. günlerde henüz döllenme gerçekleşmemiştir; bu tamamen normaldir.
   İlk 6 hafta (42 gün) en belirgin gün-gün değişimleri içerdiği için tek
   tek yazıldı; sonraki günlerde haftalık tıbbi bilgi + günlük anlatım
   birleştirilerek her gün için ayrı bir metin üretilir.
   ============================================================ */
const PREGNANCY_DAY_FACTS = [
  "Adet döneminizin ilk günü — hamilelik hesaplaması geleneksel olarak bu günden başlar, henüz döllenme gerçekleşmedi.",
  "Rahim iç zarı dökülmeye devam ediyor, vücudunuz yeni bir döngüye hazırlanıyor.",
  "Hormon seviyeleriniz (östrojen, progesteron) düşük seviyede, vücut kendini yeniliyor.",
  "Adet kanaması azalmaya başlıyor, yumurtalıklarınızda yeni foliküller gelişmeye başladı.",
  "Beyninizdeki hipofiz bezi, yumurtlamayı tetikleyecek hormonları salgılamaya başlıyor.",
  "Rahim iç zarı (endometrium) yeniden kalınlaşmaya başlıyor, olası bir gebeliğe zemin hazırlanıyor.",
  "Yumurtalıklarınızda bir folikül öne çıkmaya başladı, östrojen seviyeniz yükseliyor.",
  "Rahim ağzınızdaki mukus kıvamı değişmeye başlıyor, doğurganlık penceresine yaklaşıyorsunuz.",
  "Baskın folikül büyümeye devam ediyor, yumurtanız olgunlaşma sürecinde.",
  "Östrojen seviyeniz zirveye yaklaşıyor, vücudunuz yumurtlamaya hazırlanıyor.",
  "LH hormonu (luteinizan hormon) yükselmeye başlıyor — yumurtlama için geri sayım başladı.",
  "Doğurganlık pencereniz açık; bu günlerde ilişki, gebelik ihtimalini artırabilir.",
  "Yumurtlamaya çok yakınsınız, rahim ağzı mukusu sperm için en elverişli kıvamda.",
  "Yumurtlama gerçekleşiyor olabilir — olgun yumurta hücresi yumurtalıktan salınıyor.",
  "Eğer döllenme gerçekleştiyse, sperm ve yumurta fallop tüpünde birleşerek tek hücreli zigotu oluşturdu. Bebeğinizin benzersiz genetik yapısı bu anda belirlendi.",
  "Zigot ilk hücre bölünmesini geçirdi, iki hücreli aşamaya ulaştı ve rahme doğru yolculuğuna devam ediyor.",
  "Hücre bölünmesi hızlanıyor; artık 4 hücreli minik bir yapı var, hâlâ fallop tüpünde ilerliyor.",
  "Hücreler çoğalmaya devam ediyor; 'morula' adı verilen küçük bir hücre kümesi oluştu.",
  "Morula rahme ulaşmak üzere, içi sıvı dolu bir küreye — 'blastosist'e — dönüşmeye başlıyor.",
  "Blastosist rahme ulaştı; dış hücreler ileride plasentayı, iç hücreler ise bebeği oluşturacak.",
  "Blastosist rahim duvarına yaklaşıyor, yuvalanma (implantasyon) için hazırlanıyor.",
  "Yuvalanma (implantasyon) başlıyor — blastosist rahim duvarına tutunmaya başladı.",
  "İmplantasyon sürüyor; bazı kadınlar bu dönemde hafif bir leke (implantasyon kanaması) fark edebilir.",
  "Yuvalanma tamamlanmak üzere; embriyoyu besleyecek erken plasenta damarları oluşmaya başlıyor.",
  "hCG hormonu üretilmeye başlandı — gebelik testlerinin pozitif çıkmasını sağlayan hormon bu.",
  "hCG seviyeniz yükseliyor; bir ev testiyle gebeliği artık tespit edebilirsiniz.",
  "Embriyo iki katmana (epiblast ve hipoblast) ayrıldı; bu katmanlar ileride tüm organları oluşturacak.",
  "Amniyon kesesi ve yolk kesesi oluşmaya başlıyor — bebeğinizin ilk koruyucu ortamı şekilleniyor.",
  "'Primitif çizgi' beliriyor — bu, bebeğinizin baş-ayak ve sağ-sol eksenini belirleyen ilk yapı.",
  "Nöral tüp (ileride beyin ve omurilik olacak yapı) oluşmaya başlıyor.",
  "Nöral tüpün kapanması sürüyor; kalp hücreleri de bir araya gelip ilk kalp tüpünü oluşturmaya başlıyor.",
  "Kalp tüpü şekilleniyor; önümüzdeki günlerde ilk kalp atışları başlayacak.",
  "Bu günlerde minik kalp, ritmik olarak atmaya başlıyor olabilir — bebeğinizin ilk kalp atışları!",
  "Kalp atışları güçleniyor; kollar ve bacaklar için ilk tomurcuklar (uzuv tomurcukları) beliriyor.",
  "Uzuv tomurcukları büyüyor; beyin, üç ana bölgeye ayrılmaya başlıyor.",
  "Yüzdeki ilk hatlar — göz ve kulak taslakları — belirginleşmeye başlıyor.",
  "Sindirim sistemi ve karaciğerin temelleri oluşmaya başlıyor.",
  "Kollar ve bacaklar uzamaya, el ve ayak tomurcukları belirginleşmeye devam ediyor.",
  "Beyin hızla gelişiyor; embriyo artık belirgin bir 'C' şeklinde kıvrılmış durumda.",
  "Göz kapakları ve kulak kepçeleri şekillenmeye başlıyor.",
  "Parmak izlerinin temeli olan el ve ayak plakaları oluşuyor.",
  "6. haftanın sonuna geldiniz — embriyonik dönemin en yoğun organ oluşum evresi tamamlanmak üzere; bundan sonra 'fetüs' olarak anılacak ve büyüme hız kazanacak."
];

function pregnancyDayNote(day, week, dayInWeek, weekData) {
  if (day < PREGNANCY_DAY_FACTS.length) return PREGNANCY_DAY_FACTS[day];
  const variants = [
    `Bu haftanın ilk günü: ${weekData.babyDev}`,
    `${weekData.babyDev} Bugün bu gelişim yavaş yavaş ilerliyor.`,
    `Hafta içindeki gelişim sürüyor: ${weekData.babyDev}`,
    `Bebeğiniz bugün de büyümeye devam ediyor. ${weekData.babyDev}`,
    `${weekData.babyDev} Her gün küçük ama değerli bir adım atılıyor.`,
    `Haftanın bu gününde bebeğinizin gelişimi şöyle: ${weekData.babyDev}`,
    `Doğuma bir gün daha yaklaştınız. ${weekData.babyDev}`
  ];
  return variants[dayInWeek % variants.length];
}

const CHILD_DAY_FACTS = [
  "Doğum günü! Bebeğiniz ilk nefesini aldı, ilk kez ağladı ve muhtemelen tenden tene temasla sizinle tanıştı.",
  "Doğum sonrası ilk gün — sarılık taraması ve işitme testi gibi rutin kontroller yapılabilir.",
  "Doğum kilosunun bir miktar kaybedilmesi bu günlerde normaldir, vücut sıvı dengesini ayarlıyor.",
  "Meconium (ilk koyu renkli dışkı) atılımı tamamlanıyor, sindirim sistemi alışıyor.",
  "Emzirme/beslenme refleksleri güçleniyor; bebeğinizin sizi koku ve sesle tanıması artıyor.",
  "Uyku çoğunlukla kesintili ve kısa döngülerde; bu yenidoğan döneminde tamamen normal.",
  "Göbek kordonu kalıntısı kurumaya başlıyor, temiz ve kuru tutulması önemli.",
  "Bebeğiniz artık sesinize daha belirgin tepki veriyor, sizi diğer seslerden ayırt edebiliyor.",
  "Görme mesafesi hâlâ kısa (yaklaşık 20-30 cm) — en net sizin yüzünüzü görüyor.",
  "Uyku-uyanıklık döngüsü yavaş yavaş belirginleşmeye başlıyor.",
  "Refleks gülümsemeler görülebilir; henüz sosyal gülümseme değil ama çok tatlı bir işaret.",
  "Cilt rengi ve sarılık düzeyi doktor kontrolünde takip edilmeye devam ediyor.",
  "Göbek kordonu bu günlerde düşebilir; alt bölgeyi temiz tutmaya devam edin.",
  "Kilo takibi için bu hafta bir doktor kontrolü faydalı olabilir.",
  "Bebeğiniz artık göz temasını biraz daha uzun süre koruyabiliyor.",
  "İşitme keskinleşiyor; ani seslere irkilme refleksi (Moro refleksi) belirgin.",
  "Uyanık kaldığı süreler yavaşça uzamaya başlıyor.",
  "Yüzünüzü ve tanıdık sesleri takip etmeye başlıyor.",
  "Karın üstü (tummy time) kısa süreli denemeler boyun kaslarını güçlendirmeye yardımcı olur.",
  "Emzirme/biberon düzeni oturmaya başlıyor, beslenme aralıkları biraz daha öngörülebilir olabilir.",
  "Doğum kilosuna geri dönüş bu günlerde beklenir — merak ediyorsanız doktorunuzla kontrol edebilirsiniz.",
  "Sesli uyaranlara (müzik, konuşma) verdiği tepkiler artıyor.",
  "Ellerini fark etmeye, kısa süreli izlemeye başlayabilir.",
  "Uyku süreleri gün içinde biraz daha düzene girmeye başlıyor.",
  "Cildi hassas olmaya devam ediyor; nazik, parfümsüz ürünler tercih edilmesi önerilir.",
  "Ağlama tonları farklılaşmaya başlıyor — açlık, yorgunluk gibi ihtiyaçları ayırt etmeye çalışabilirsiniz.",
  "Baş kontrolü yavaş yavaş güçleniyor, kucakta tutarken destek vermeye devam edin.",
  "Bir aylık döneme yaklaşıyorsunuz — genel bir doktor kontrolü planlamanın tam zamanı.",
  "Gülümsemeler artık daha sosyal bir hal almaya başlıyor olabilir.",
  "1. Ay tamamlandı — bebeğiniz doğduğundan bu yana inanılmaz bir uyum süreci geçirdi; artık aylık gelişim dönemine giriyorsunuz."
];

function childDayNote(day, months, milestone) {
  if (day < CHILD_DAY_FACTS.length) return CHILD_DAY_FACTS[day];
  const variants = [
    `Bugün motor gelişimde şu aşamadasınız: ${milestone.motor}`,
    `Dil gelişiminde bugünkü resim: ${milestone.language}`,
    `Beyin gelişiminde bugün öne çıkan: ${milestone.brain}`,
    `${milestone.motor} Her gün küçük ama kıymetli bir ilerleme kaydediliyor.`,
    `${milestone.language} Bebeğinizle konuşmaya devam edin, bu gelişimi destekler.`,
    `${milestone.brain} Bu ay boyunca bu alan gelişmeye devam edecek.`,
    `Bu ayki genel tabloya bugün bir gün daha eklendi: ${milestone.motor}`
  ];
  return variants[day % 7];
}

const BABY_SLEEP_TIPS = [
  "Bugün uyku öncesi Beyaz Gürültü açmak, rahim içindeki sesleri anımsatarak bebeğinizi rahatlatabilir.",
  "Kahverengi Gürültü, derin ve düşük frekansıyla uzun uykuya geçişte etkili olabilir.",
  "Rahim Sesi kaydı, yeni doğan bebeklerde ağlamayı azaltmaya yardımcı olabilir.",
  "Kalp Atışı sesi, anne karnındaki güvenli hissi yeniden yaratarak sakinleştirir.",
  "Yağmur sesi ile sabit ve monoton bir ortam, uykuya dalmayı kolaylaştırabilir.",
  "Pembe Gürültü, beyaz gürültüye göre daha yumuşak bir alternatif olarak denenebilir.",
  "Ninni eşliğinde sabit bir uyku rutini kurmak, bebeğin uyku saatini iç saatine oturtur."
];
const BABY_FEEDING_TIPS = [
  "Bugün beslenme aralıklarını sabit tutmaya özen gösterin, bu düzen hissi kazandırır.",
  "Emzirme sonrası bebeği dik tutup geğirtmek gaz sancısını azaltabilir.",
  "Biberon kullanıyorsanız su ısısını kontrol etmeyi unutmayın.",
  "Büyüme atağı dönemlerinde bebeğin daha sık beslenme istemesi normaldir.",
  "Ek gıdaya başlandıysa yeni besinleri tek tek ve 2-3 gün arayla tanıtın."
];
const BABY_DOCTOR_TIPS = [
  "Bu ay rutin kontrolünüzde boy, kilo ve baş çevresi ölçümünü yaptırmayı unutmayın.",
  "Aşı takviminizde yaklaşan bir doz varsa randevunuzu şimdiden planlayın.",
  "Cilt döküntüsü, sürekli ağlama ya da beslenme reddi durumunda doktorunuza danışın.",
  "Bu dönemde işitme ve görme taramalarının zamanlaması önemlidir.",
  "Gelişim basamaklarında gecikme şüpheniz varsa erken dönemde çocuk doktorunuza danışmak en doğrusu."
];
const BABY_MOM_TIPS = [
  "Bugün kendinize de birkaç dakika ayırın; dinlenmiş bir anne, sakin bir bebek demektir.",
  "Bebeğinizle göz teması kurarak konuşmak dil gelişimini destekler.",
  "Küçük başarıları kutlamak sizi de motive eder, bugünü not almayı unutmayın.",
  "Partnerinizle görev paylaşımı yapmak yorgunluğu azaltabilir.",
  "Bebeğinizin sinyallerini gözlemlemek zamanla daha kolay hale gelecek, kendinize güvenin."
];
const BABY_TOY_TIPS = [
  "Kontrast renkli oyuncaklar bu dönemde görsel gelişimi destekler.",
  "Dokulu kumaş kitaplar dokunsal keşfi teşvik eder.",
  "Ses çıkaran yumuşak oyuncaklar işitsel farkındalığı artırır.",
  "Şekil eşleştirme kutuları ince motor ve problem çözme becerisini geliştirir.",
  "Yığma bardaklar denge ve el-göz koordinasyonunu destekler.",
  "Basit yapboz parçaları bu yaşta bilişsel gelişime katkı sağlar."
];
const GROWTH_CHECKPOINTS = [
  {d:0, h:50, w:3.3}, {d:30, h:54, w:4.2}, {d:60, h:58, w:5.1}, {d:90, h:61, w:5.8},
  {d:120, h:63, w:6.4}, {d:150, h:65, w:6.9}, {d:180, h:67, w:7.3}, {d:270, h:71, w:8.6},
  {d:365, h:75, w:9.6}, {d:547, h:80, w:10.8}, {d:730, h:86, w:12.2}, {d:1095, h:95, w:14.2},
  {d:1460, h:102, w:16.3}, {d:1825, h:110, w:18.4}, {d:2190, h:116, w:20.5}
];
function growthAtDay(days) {
  const pts = GROWTH_CHECKPOINTS;
  let i = 0;
  while (i < pts.length-1 && pts[i+1].d < days) i++;
  const a = pts[i], b = pts[Math.min(i+1, pts.length-1)];
  const span = Math.max(1, b.d - a.d);
  const t = clamp((days - a.d) / span, 0, 1);
  return {
    height: +(a.h + (b.h - a.h) * t).toFixed(1),
    weight: +(a.w + (b.w - a.w) * t).toFixed(2)
  };
}

const VACCINE_SCHEDULE = [
  {ageMonths:0, name:"Hepatit B (1. doz)"},
  {ageMonths:2, name:"BCG (Verem Aşısı)"},
  {ageMonths:2, name:"6'lı Karma — DaBT-İPA-Hib-Hepatit B (1. doz)"},
  {ageMonths:2, name:"KPA — Konjuge Pnömokok Aşısı (1. doz)"},
  {ageMonths:4, name:"6'lı Karma (2. doz)"},
  {ageMonths:4, name:"KPA (2. doz)"},
  {ageMonths:6, name:"6'lı Karma (3. doz)"},
  {ageMonths:6, name:"OPA — Ağızdan Çocuk Felci Aşısı (1. doz)"},
  {ageMonths:12, name:"KPA Rapel (3. doz)"},
  {ageMonths:12, name:"KKK — Kızamık-Kızamıkçık-Kabakulak (1. doz)"},
  {ageMonths:12, name:"Suçiçeği (1. doz)"},
  {ageMonths:18, name:"DaBT-İPA-Hib Rapel"},
  {ageMonths:18, name:"OPA (2. doz)"},
  {ageMonths:18, name:"KKK (2. doz)"},
  {ageMonths:18, name:"Hepatit A (1. doz)"},
  {ageMonths:24, name:"Hepatit A (2. doz)"},
  {ageMonths:48, name:"DaBT-İPA Rapel (4-6 yaş)"},
  {ageMonths:78, name:"Td — Tetanoz-Difteri (İlkokul 1. Sınıf, yaklaşık 6-7 yaş)"}
];
// Geriye dönük uyumluluk için eski isim
const VACCINES = VACCINE_SCHEDULE.map(v=>({age: v.ageMonths===0?"Doğumda":`${v.ageMonths}. Ay`, name:v.name}));

const WEANING_FOODS = [
  {name:"Elma Püresi", gram:"1-2 tatlı kaşığı", prep:"Elmayı soyup buharda pişirin, iyice ezin.", alt:"Armut püresi", allergy:"Nadir, gaz yapabilir."},
  {name:"Muz Ezmesi", gram:"2-3 tatlı kaşığı", prep:"Olgun muzu çatalla ezin, pişirmeye gerek yok.", alt:"Avokado ezmesi", allergy:"Düşük risk."},
  {name:"Havuç Püresi", gram:"1-2 tatlı kaşığı", prep:"Buharda yumuşayana kadar pişirip ezin.", alt:"Balkabağı püresi", allergy:"Düşük risk."},
  {name:"Bebek Pirinç Unu Ustası", gram:"1-2 yemek kaşığı sulandırılmış", prep:"Anne sütü/mama ile karıştırıp pürüzsüz hale getirin.", alt:"Yulaf ustası", allergy:"Glutensiz, düşük risk."},
  {name:"Tatlı Patates Püresi", gram:"1-2 tatlı kaşığı", prep:"Fırında/buharda pişirip ezin.", alt:"Kabak püresi", allergy:"Düşük risk."},
  {name:"Avokado Ezmesi", gram:"1-2 tatlı kaşığı", prep:"Olgun avokadoyu çatalla ezin.", alt:"Muz ezmesi", allergy:"Düşük risk."},
  {name:"Armut Püresi", gram:"1-2 tatlı kaşığı", prep:"Buharda pişirip ezin.", alt:"Elma püresi", allergy:"Düşük risk."},
  {name:"Kabak Püresi", gram:"1-2 tatlı kaşığı", prep:"Buharda pişirip ezin.", alt:"Havuç püresi", allergy:"Düşük risk."},
  {name:"Brokoli Püresi", gram:"1 tatlı kaşığı", prep:"Buharda yumuşatıp iyice ezin/süzün.", alt:"Karnabahar püresi", allergy:"Gaz yapabilir, azar azar verin."},
  {name:"Yulaf Lapası", gram:"1-2 yemek kaşığı", prep:"İnce çekilmiş yulafı süt/su ile pişirin.", alt:"Pirinç unu ustası", allergy:"Düşük risk."},
  {name:"Karışık Sebze Püresi", gram:"2-3 tatlı kaşığı", prep:"Havuç, kabak, patatesi birlikte haşlayıp ezin.", alt:"Tek çeşit sebze püresi", allergy:"Yeni her sebzeyi tek tek tanıtın."},
  {name:"Mercimek Püresi (ince)", gram:"1-2 tatlı kaşığı", prep:"Kırmızı mercimeği iyice pişirip süzerek ezin.", alt:"Nohut püresi (ileri ay)", allergy:"İlk baklagil denemesi, azar azar."},
  {name:"Şeftali Püresi", gram:"1-2 tatlı kaşığı", prep:"Kabuğunu soyup buharda pişirip ezin.", alt:"Kayısı püresi", allergy:"Düşük risk."},
  {name:"Ispanak Karışımı", gram:"1 tatlı kaşığı", prep:"Az miktarda haşlayıp başka bir sebzeyle karıştırın.", alt:"Kabak ile karıştırılabilir", allergy:"Nitrat içeriği nedeniyle az miktarda verin."}
];
const AVOID_FOODS = ["Bal (1 yaş altı botulizm riski)","Tuz ve şeker eklenmiş yiyecekler","İnek sütü (1 yaş altı ana içecek olarak)","Bütün fındık/fıstık (boğulma riski)","İşlenmiş/paketli gıdalar","Az pişmiş yumurta ve et"];

/* ============================================================
   BESLENME GÜNLÜĞÜ ÖNERİLERİ — yaşa göre örnek, dengeli besin
   kombinasyonları. Anneler kendi verdikleri yemekleri de serbestçe
   kaydedebilir; bu liste sadece fikir vermesi için bir öneri havuzudur.
   ============================================================ */
const FOOD_COMBO_SUGGESTIONS = [
  {age:"6-8 Ay", combo:"Somon Balığı ve Patates Püresi", tag:"Balık", detail:"Omega-3 ve demir açısından zengindir; haşlanmış patatesle ezilerek pürüzsüz kıvamda verilebilir."},
  {age:"6-8 Ay", combo:"Tatlı Patates ve Nohut Püresi", tag:"Baklagil", detail:"Lif ve B vitamini kaynağıdır, kabızlığı önlemeye yardımcı olabilir."},
  {age:"6-8 Ay", combo:"Avokado ve Muz Ezmesi", tag:"Meyve", detail:"Sağlıklı yağlar ve enerji sağlar, pişirmeye gerek yoktur."},
  {age:"6-8 Ay", combo:"Karışık Sebze ve Zeytinyağı Püresi", tag:"Sebze", detail:"Havuç, kabak ve patatesi birlikte haşlayıp az zeytinyağıyla ezin."},
  {age:"9-11 Ay", combo:"Tavuklu Sebze Yemeği (Ezilmiş)", tag:"Et/Tavuk", detail:"Protein ve demir kaynağıdır; sebzelerle birlikte hafif ezilmiş kıvamda sunulabilir."},
  {age:"9-11 Ay", combo:"Kırmızı Mercimek Çorbası ve Yoğurt", tag:"Baklagil", detail:"Bitkisel protein ve probiyotik desteği bir arada verilir."},
  {age:"9-11 Ay", combo:"Yumurta Sarısı ve Ekmek Parçaları", tag:"Yumurta", detail:"İyi pişmiş yumurta sarısı demir ve kolin açısından zengindir."},
  {age:"9-11 Ay", combo:"Balık (Levrek/Somon) ve Pirinç Pilavı", tag:"Balık", detail:"Küçük parçalar halinde, kılçıksız ve iyi pişmiş şekilde sunulmalıdır."},
  {age:"12+ Ay", combo:"Köfte ve Haşlanmış Sebzeler", tag:"Et", detail:"Küçük lokmalar halinde verilerek çiğneme becerisi desteklenir."},
  {age:"12+ Ay", combo:"Tam Tahıllı Makarna ve Ispanaklı Sos", tag:"Tahıl", detail:"Kompleks karbonhidrat ve demir bir arada sunulur."},
  {age:"12+ Ay", combo:"Nohutlu Sebze Yemeği ve Yoğurt", tag:"Baklagil", detail:"Lif, protein ve kalsiyum dengesi sağlar."},
  {age:"12+ Ay", combo:"Izgara Tavuk ve Bulgur Pilavı", tag:"Et/Tavuk", detail:"Aile sofrasına geçişte tuzsuz/az baharatlı hazırlanabilir."}
];

/* ============================================================
   DİŞ ÇIKARMA — rahatlatıcı yöntemler ve neden işe yaradıkları.
   Bilgiler genel kaynaklardan derlenmiştir; ilaç/jel içeren ürünler
   için mutlaka doktor/eczacıya danışılması gerektiği belirtilir.
   ============================================================ */
const TEETHING_RELIEF_ITEMS = [
  {name:"Soğuk Diş Kaşıyıcı (Teether)", type:"Doğal Yöntem", icon:Smile, color:"blue",
    why:"Buzdolabında soğutulmuş (dondurucuda değil) silikon kaşıyıcılar, diş etindeki sinir uçlarını geçici olarak hissizleştirir ve şişliği azaltır; bebeğin çiğneme ihtiyacını güvenle karşılar.",
    note:"Dondurucuda bekletmeyin — aşırı sertleşen kaşıyıcı diş etine zarar verebilir."},
  {name:"Soğuk, Nemli Gazlı Bez", type:"Doğal Yöntem", icon:Droplet, color:"blue",
    why:"Temiz bir bezi soğuk suyla ıslatıp hafifçe diş etine sürmek hem soğuk etkisiyle rahatlatır hem de hafif masaj basıncıyla kaşıntı hissini azaltır.",
    note:"Her kullanımdan önce ve sonra bezi temiz tutun."},
  {name:"Parmakla Diş Eti Masajı", type:"Doğal Yöntem", icon:Heart, color:"pink",
    why:"Temiz parmakla nazikçe uygulanan baskı, diş etindeki basınç hissini dengeleyerek ağrı algısını azaltabilir.",
    note:"Ellerinizi mutlaka yıkayın ve tırnaklarınızın kısa olduğundan emin olun."},
  {name:"Soğutulmuş Meyve Filesi", type:"Doğal Yöntem", icon:Utensils, color:"green",
    why:"Ek gıdaya başlamış bebeklerde file içine konan soğuk meyve (armut, muz gibi) hem soğuk rahatlığı sağlar hem de boğulma riski olmadan çiğneme pratiği yaptırır.",
    note:"Sadece 6 ay ve üzeri, ek gıdaya başlamış bebeklerde kullanılmalıdır."},
  {name:"Calgel Diş Jeli", type:"Eczane Ürünü", icon:Pill, color:"purple",
    why:"İçeriğindeki lidokain hidroklorür diş etindeki sinir uçlarını geçici olarak uyuşturarak ağrıyı hafifletir; setilpiridinyum klorür ise antiseptik etkiyle bölgeyi mikroplara karşı korur.",
    note:"3 aydan küçük bebeklerde kullanılmaz. Kullanmadan önce mutlaka eczacınıza/doktorunuza danışın ve ambalajdaki doz talimatına uyun."},
  {name:"Dentinox Diş Jeli", type:"Eczane Ürünü", icon:Pill, color:"purple",
    why:"Lidokain hidroklorür ile birlikte papatya (kamomil) tentürü içerir; lidokain bölgesel uyuşma sağlarken papatya diş etindeki hafif tahrişi yatıştırıcı etki gösterir.",
    note:"Kullanmadan önce doktorunuza/eczacınıza danışın, ambalajdaki doz talimatına uyun."},
  {name:"Kehribar Kolye", type:"Önerilmez", icon:AlertCircle, color:"pink", warn:true,
    why:"Isıyla 'ağrı kesici madde' salındığı iddiası bilimsel olarak kanıtlanmamıştır; etkisi kanıtlanmış bir yöntem değildir.",
    note:"Boğulma ve boğazına dolanma riski nedeniyle başta FDA olmak üzere birçok sağlık otoritesi bebeklerde kullanılmamasını önerir."}
];

/* Bugün huzursuz mu? cevabına göre önceliklendirilmiş öneri sırası */
const TEETHING_RESTLESS_TIP_ORDER = ["Soğuk Diş Kaşıyıcı (Teether)","Soğuk, Nemli Gazlı Bez","Parmakla Diş Eti Masajı","Soğutulmuş Meyve Filesi","Calgel Diş Jeli","Dentinox Diş Jeli"];
const TEETHING_CALM_TIP_ORDER = ["Parmakla Diş Eti Masajı","Soğuk Diş Kaşıyıcı (Teether)","Soğutulmuş Meyve Filesi"];

/* ============================================================
   KAKA TAKİBİ — kıvam türleri ve kabızlık için genel öneriler
   ============================================================ */
const STOOL_TYPES = [
  {key:"sert", label:"Sert / Topak", color:"pink", flag:"Kabızlık belirtisi olabilir", urgent:false},
  {key:"normal", label:"Normal / Şekilli", color:"green", flag:"Normal görünüyor", urgent:false},
  {key:"yumusak", label:"Yumuşak", color:"green", flag:"Normal görünüyor", urgent:false},
  {key:"sulu", label:"Sulu / Cıvık", color:"blue", flag:"Sık tekrarlarsa ishal olabilir, sıvı takibi yapın", urgent:false},
  {key:"yesil", label:"Yeşilimsi", color:"purple", flag:"Genelde zararsızdır, uzun sürerse doktora danışın", urgent:false},
  {key:"mukuslu", label:"Mukuslu", color:"purple", flag:"Sindirim sistemi tahrişi olabilir", urgent:false},
  {key:"kanli", label:"Kanlı", color:"pink", flag:"Vakit kaybetmeden doktorunuza başvurun", urgent:true}
];
const CONSTIPATION_TIPS = [
  "6 aydan büyükse bebeğinizin günlük su alımını artırın.",
  "Erik, armut ve kayısı gibi lifli meyve püreleri bağırsak hareketini destekleyebilir.",
  "Bacaklarını bisiklet çevirir gibi nazikçe hareket ettirmek bağırsakları rahatlatabilir.",
  "Karnına, saat yönünde nazik bir masaj yapmak rahatlatıcı olabilir.",
  "Ilık bir banyo karın kaslarını gevşeterek rahatlamaya yardımcı olabilir.",
  "3 günden uzun süredir kakası gelmiyorsa, kakasında kan varsa veya şiddetli ağlama/karın şişliği görülüyorsa vakit kaybetmeden doktorunuza başvurun."
];

// NOT: "noise" tipindeki sesler (white/pink/brown) tarayıcıda Web Audio API
// ile GERÇEK ZAMANLI ÜRETİLİR — dosya gerektirmez, her zaman çalışır.
// Diğerleri (yağmur, okyanus, tren vb.) gerçek kayıt olduğundan bir ses
// dosyası URL'ine ihtiyaç duyar. `url` alanına kendi barındırdığınız
// (örn. CDN/Storage) bir .mp3/.m4a bağlantısı verin. `url` boşsa ve
// `noise` de değilse, tıklandığında sessizce "çalıyor" GÖSTERMEK YERİNE
// kullanıcıya "ses dosyası eklenmedi" uyarısı gösterilir.
const SLEEP_SOUNDS = [
  {name:"Beyaz Gürültü", icon: Wind, noise:"white"},
  {name:"Kahverengi Gürültü", icon: Wind, noise:"brown"},
  {name:"Pembe Gürültü", icon: Wind, noise:"pink"},
  {name:"Rahim Sesi", icon: Heart, url:""},
  {name:"Kalp Atışı", icon: Activity, url:"/audio/kalp-atisi.mp3"},
  {name:"Yağmur", icon: CloudRain, url:""},
  {name:"Fırtına", icon: CloudRain, url:"/audio/firtina.mp3"},
  {name:"Okyanus", icon: Waves, url:"/audio/okyanus.mp3"},
  {name:"Orman", icon: TreePine, url:""},
  {name:"Şelale", icon: Waves, url:""},
  {name:"Rüzgar", icon: Wind, noise:"white"},
  {name:"Şömine", icon: Flame, url:""},
  {name:"Tren", icon: Train, url:""},
  {name:"Araba", icon: Car, url:""},
  {name:"Elektrik Süpürgesi", icon: Wind, noise:"white"},
  {name:"Fön Makinesi", icon: Wind, noise:"white"},
  {name:"Ninni", icon: Music2, url:""}
];

const DAILY_ARTICLES_POOL = [
  {icon: Brain, title:"Bugünkü Gelişim", color:"purple", body:"Bebeğinizin beyin gelişimi bugün önemli bir aşamadan geçiyor; duyusal uyaranlara verdiği tepkiler artıyor."},
  {icon: AlertCircle, title:"Dikkat Edilmesi Gerekenler", color:"pink", body:"Bugün ani duruş değişikliklerinde baş dönmesi yaşayabilirsiniz, yavaş hareket edin."},
  {icon: Utensils, title:"Beslenme Önerisi", color:"green", body:"Demir ve folik asit açısından zengin yeşil yapraklı sebzeleri öğününüze ekleyin."},
  {icon: Activity, title:"Bugünkü Aktivite", color:"blue", body:"15 dakikalık hafif tempolu yürüyüş dolaşımınızı ve ruh halinizi destekler."},
  {icon: Info, title:"Mini Bilgi", color:"purple", body:"Bebekler rahim içindeyken annenin sesini tanımaya başlar."},
  {icon: Sparkles, title:"Motivasyon", color:"pink", body:"Her gün, bebeğinize dair yeni bir hikaye yazıyorsunuz. Bugün de harika gidiyorsunuz."},
  {icon: Droplet, title:"Su Hedefi", color:"blue", body:"Bugün için hedefiniz 2.3 litre su. Şu ana kadar takip etmeyi unutmayın."},
  {icon: Pill, title:"Vitamin Hatırlatması", color:"green", body:"Demir ve D vitamini takviyenizi almayı unutmayın."},
  {icon: Dumbbell, title:"Egzersiz", color:"pink", body:"10 dakikalık pelvik taban (Kegel) egzersizi bugün için önerilir."},
  {icon: Stethoscope, title:"Doktor Önerisi", color:"blue", body:"Bir sonraki kontrolünüzde kan şekeri taramasını sormayı unutmayın."}
];

const AI_RESPONSES = [
  {keys:["muz","meyve"], reply:"8 aylık bebekler genellikle iyice ezilmiş muz tüketebilir. Yeni bir besini tanıtırken 2-3 gün boyunca tek başına verip alerji belirtisi (kızarıklık, döküntü, kusma) olup olmadığını gözlemleyin. Endişeleriniz sürerse çocuk doktorunuza danışın."},
  {keys:["ateş","38"], reply:"38°C hafif ateş sayılır ama bebeğin yaşına ve genel haline göre değerlendirilmelidir. Bol sıvı verin, hafif giydirin ve ateşi takip edin. 3 aydan küçük bebeklerde veya ateş 38.5°C üzerine çıkıp düşmüyorsa vakit kaybetmeden doktorunuza başvurun."},
  {keys:["ağlıyor","ağlama","gece"], reply:"Gece sürekli ağlama; açlık, gaz sancısı, diş çıkarma veya rahatsızlık gibi birçok nedenden kaynaklanabilir. Kundak, beyaz gürültü ve rutin bir uyku düzeni yardımcı olabilir. Ağlama şiddetliyse veya başka belirtiler eşlik ediyorsa doktorunuza danışmanızı öneririm."},
  {keys:["kusuyor","kusma"], reply:"Ara sıra kusma bebeklerde sık görülür, özellikle beslenme sonrası. Ancak sık tekrarlayan, projeksiyon tarzı kusma veya kusmayla birlikte halsizlik/ateş varsa vakit kaybetmeden bir sağlık kuruluşuna başvurun."},
  {keys:["uyumuyor","uyku"], reply:"Uyku düzensizliği büyüme atakları, aşırı yorgunluk veya ortam faktörlerinden kaynaklanabilir. Sabit bir uyku rutini (banyo, ninni, karartılmış oda) düzeni oturtmaya yardımcı olabilir."}
];
const AI_FALLBACK = "Bu konuda genel bilgi verebilirim, ancak kesin teşhis koyamam. Belirtiler devam ediyorsa veya endişe vericiyse lütfen bir sağlık profesyoneline danışın. Başka nasıl yardımcı olabilirim?";

const ONBOARDING_SLIDES = [
  {icon: Baby, title:"Hamilelik Takibi", desc:"Gün gün, hafta hafta; bebeğinizin ve sizin gelişiminizi birlikte takip edin.", color:"pink"},
  {icon: TrendingUp, title:"Günlük Gelişim", desc:"Her gün size ve bebeğinize özel yeni bilgiler ve öneriler sunulur.", color:"blue"},
  {icon: Brain, title:"Yapay Zeka Anne Asistanı", desc:"Merak ettiklerinizi sorun, aklınız daha rahat olsun.", color:"purple"},
  {icon: Heart, title:"Sağlıklı Anne & Mutlu Bebek", desc:"Beslenmeden uykuya, tüm yolculuğunuzda yanınızdayız.", color:"green"}
];

const SHOPPING_BY_AGE = {
  "0-3 Ay": ["Bebek Bezi","Islak Mendil","Zıbın Takımı","Kundak","Emzik","Biberon"],
  "6 Ay": ["Mama Sandalyesi","Kaşık","Suluk","Diş Kaşıyıcı","Bebek Öğütücü"],
  "12 Ay": ["Yürüteç/Denge Aracı","Eğitici Oyuncaklar","Yumuşak Ayakkabı","Kaşık-Çatal Seti"],
  "24 Ay": ["Üç Tekerlekli Bisiklet","Boyama Seti","Kitaplık","Puzzle"]
};

const ACTIVITIES_POOL = [
  {title:"Ce-e Oyunu", skill:"Nesne kalıcılığı, sosyal bağ", duration:"5 dk", materials:"Yok", age:"0-6 ay"},
  {title:"Renkli Kumaş Dokusu", skill:"Duyusal gelişim", duration:"10 dk", materials:"Farklı dokularda kumaşlar", age:"0-6 ay"},
  {title:"Ayna Oyunu", skill:"Öz farkındalık, görsel takip", duration:"5 dk", materials:"Kırılmaz bebek aynası", age:"0-6 ay"},
  {title:"Karşılıklı Ses Taklidi", skill:"Dil gelişimi, sosyal etkileşim", duration:"10 dk", materials:"Yok", age:"0-6 ay"},
  {title:"Yüzüstü Zamanı (Tummy Time)", skill:"Boyun ve gövde kası gelişimi", duration:"10 dk", materials:"Yumuşak bir mat", age:"0-6 ay"},
  {title:"Asılı Oyuncak Takibi", skill:"Görsel takip, el-göz koordinasyonu", duration:"10 dk", materials:"Asılabilen oyuncak/aktivite kemeri", age:"0-6 ay"},
  {title:"Kutu Yığma", skill:"İnce motor, denge kavramı", duration:"15 dk", materials:"Küçük kutular", age:"6-12 ay"},
  {title:"Parmak Boyama", skill:"Yaratıcılık, dokunsal keşif", duration:"20 dk", materials:"Yıkanabilir parmak boyası", age:"6-12 ay"},
  {title:"Kavanoz Kapağı Eşleştirme", skill:"İnce motor, problem çözme", duration:"10 dk", materials:"Farklı boy kavanoz ve kapakları", age:"6-12 ay"},
  {title:"Emekleme Parkuru", skill:"Kaba motor, denge", duration:"15 dk", materials:"Yastıklar, minderler", age:"6-12 ay"},
  {title:"Su Oyunu (Gözetimli)", skill:"Duyusal keşif, sebep-sonuç", duration:"15 dk", materials:"Sığ bir kap, su, bardak", age:"6-12 ay"},
  {title:"Hazine Avı", skill:"Problem çözme, kaba motor", duration:"20 dk", materials:"Küçük oyuncaklar", age:"12-24 ay"},
  {title:"Bloklarla Kule Yapma", skill:"İnce motor, denge, nedensellik", duration:"15 dk", materials:"Yapı blokları", age:"12-24 ay"},
  {title:"Resimli Kitap Okuma Saati", skill:"Dil gelişimi, dikkat süresi", duration:"10 dk", materials:"Resimli çocuk kitabı", age:"12-24 ay"},
  {title:"Şekil Kutusuna Atma", skill:"Şekil tanıma, ince motor", duration:"15 dk", materials:"Şekilli sorter kutusu", age:"12-24 ay"},
  {title:"Dans ve Müzik Zamanı", skill:"Ritim, kaba motor, duygu ifadesi", duration:"10 dk", materials:"Müzik çalar", age:"12-24 ay"},
  {title:"Basit Puzzle Tamamlama", skill:"Problem çözme, el-göz koordinasyonu", duration:"15 dk", materials:"4-6 parçalı büyük puzzle", age:"2-3 yaş"},
  {title:"Rol Yapma Oyunu (Market/Doktor)", skill:"Sosyal-duygusal gelişim, hayal gücü", duration:"20 dk", materials:"Ev içi malzemeler", age:"2-3 yaş"},
  {title:"Renk ve Sayı Avı", skill:"Bilişsel gelişim, sınıflandırma", duration:"15 dk", materials:"Yok", age:"2-3 yaş"},
  {title:"Bahçe/Doğa Yürüyüşü Keşfi", skill:"Doğa farkındalığı, kaba motor", duration:"25 dk", materials:"Dışarıda yürüyüş alanı", age:"2-3 yaş"},
  {title:"Basit Tarif ile Mutfakta Yardım", skill:"İnce motor, sıra takibi", duration:"20 dk", materials:"Güvenli mutfak malzemeleri", age:"3+ yaş"},
  {title:"Hikaye Tamamlama Oyunu", skill:"Yaratıcılık, dil gelişimi", duration:"15 dk", materials:"Yok", age:"3+ yaş"},
  {title:"Basit Bilim Deneyi (Batar-Batmaz)", skill:"Merak, gözlem, nedensellik", duration:"20 dk", materials:"Bir kap su, farklı nesneler", age:"3+ yaş"}
];
const CRAFTS_POOL = [
  {title:"Kağıttan Uçak", age:"4+", cat:"Origami", materials:"1 adet A4 kağıt",
    steps:["A4 kağıdı uzun kenarından ikiye katlayıp açın, ortada bir çizgi oluşsun.","Üst iki köşeyi orta çizgiye doğru katlayarak bir üçgen oluşturun.","Üçgenin uçlarını tekrar orta çizgiye doğru katlayın, sivri bir burun elde edin.","Kağıdı orta çizgiden ikiye katlayın.","Her iki tarafın kanadını aşağı doğru katlayarak kanatları oluşturun.","Uçağı ortadan tutup hafifçe fırlatın, kanat açılarını oynayarak menzili değiştirebilirsiniz."],
    tip:"4 yaş üstü çocuklar katlama adımlarını sizinle birlikte deneyebilir, ince motor becerilerini geliştirir."},
  {title:"Karton Kutu Şatosu", age:"3+", cat:"Karton Etkinlik", materials:"Birkaç boş karton kutu, makas (yetişkin kullanır), bant, boya/yaldız kağıdı",
    steps:["Farklı boyutlarda boş karton kutuları (ayakkabı kutusu, kargo kutusu vb.) toplayın.","Kutuların üstüne makasla (yetişkin yardımıyla) kule şekli için üçgen çentikler açın.","Kutuları bantla birbirine sabitleyerek şato duvarlarını oluşturun.","Çocuğunuzla birlikte boya, keçeli kalem veya yaldız kağıdıyla süsleyin.","İsterseniz tuvalet kağıdı rulolarından kule ekleyip bayrak (kürdan+kağıt) dikebilirsiniz."],
    tip:"Büyük parça inşa oyunu, uzamsal algı ve yaratıcı hayal gücünü destekler; keskin kenarları yetişkin kesmelidir."},
  {title:"Parmak Boyası Elma Ağacı", age:"2+", cat:"Boyama", materials:"Yıkanabilir parmak boyası, kağıt, kahverengi kalem",
    steps:["Kağıdın alt ortasına kahverengi kalemle basit bir ağaç gövdesi ve dallar çizin.","Çocuğunuzun parmağını yeşil boyaya batırıp dalların etrafına yapraklar için bastırmasına yardımcı olun.","Kırmızı boyayla parmak izi 'elmalar' ekleyin.","Boyanın tamamen kurumasını bekleyip çerçeveleyebilirsiniz."],
    tip:"Dokunsal keşif ve renk tanımayı destekler; küçük çocuklarda boyayı ağza götürmemesine dikkat edin."},
  {title:"Çorap Kuklası", age:"3+", cat:"Kukla", materials:"Eşi olmayan bir çorap, düğme veya keçe göz, iplik, makas",
    steps:["Temiz, eşi kalmamış bir çorabı elinize geçirin, topuk kısmı ağız gibi hareket edecek.","Keçeden veya düğmeden göz, kumaştan dil kesip çorabın üzerine yapıştırın/dikin.","İplikten saç veya bıyık ekleyebilirsiniz.","Kukla tamamlandığında çocuğunuzla birlikte kısa bir hikaye canlandırın."],
    tip:"Dil gelişimini ve empati kurmayı destekleyen rol yapma oyunu için harika bir araçtır."},
  {title:"Şekil Kes Yapıştır Kolaj", age:"3+", cat:"Kes Yapıştır", materials:"Renkli kağıtlar, güvenlik makası, yapıştırıcı, büyük bir karton",
    steps:["Renkli kağıtlardan daire, kare, üçgen gibi basit şekiller kesin (küçük çocuklar için siz kesebilirsiniz).","Çocuğunuzun şekilleri karton üzerine istediği düzende yapıştırmasına izin verin.","Yapıştırdıkça şekillerin adlarını ve renklerini birlikte tekrar edin.","İsteğe bağlı olarak ortaya çıkan kolajı bir tema (ev, araba, hayvan) etrafında şekillendirin."],
    tip:"Şekil ve renk tanımayı, güvenli makas kullanımıyla ince motor becerileri geliştirir."},
  {title:"Pirinç Duyu Kutusu", age:"1+", cat:"Duyu Oyunu", materials:"Kuru pirinç veya nohut, geniş bir kap, küçük kaşık/kap, oyuncaklar",
    steps:["Geniş, sığ bir kabın içine kuru pirinç veya nohut doldurun.","İçine küçük kaşık, huni veya minik oyuncaklar/figürler saklayın.","Çocuğunuzun elleriyle karıştırmasına, kaşıkla doldurup boşaltmasına veya oyuncakları aramasına izin verin.","Etkinlik sırasında yanından ayrılmayın, küçük taneler boğulma riski taşır."],
    tip:"Dokunsal duyu gelişimini ve el-göz koordinasyonunu destekler; 3 yaş altı için sıkı gözetim şarttır."},
  {title:"Renk Sıralama Montessori Tepsisi", age:"2+", cat:"Montessori", materials:"Farklı renkte küçük nesneler (boncuk, blok, kapak), bölmeli bir tepsi veya kaseler",
    steps:["Evde bulunan farklı renkteki küçük nesneleri (kapak, blok, boncuk gibi) bir araya toplayın.","Her renk için ayrı bir kase veya bölme hazırlayın.","Nesneleri karıştırıp çocuğunuzdan renklerine göre ilgili kaseye ayırmasını isteyin.","Zorlandığında rengi söyleyerek yardımcı olun, başardığında kutlayın."],
    tip:"Renk eşleştirme, sınıflandırma mantığı ve odaklanma becerisini geliştiren klasik bir Montessori etkinliğidir."}
];
const STORIES_POOL = [
  {title:"Uykucu Ayıcık", cat:"Uyku Hikayesi", dur:"5 dk", url:"", text:"Bir zamanlar ormanın derinliklerinde küçük bir ayıcık yaşarmış. Her akşam yıldızlar gökyüzünde parlamaya başladığında, ayıcık yumuşak yatağına kıvrılır ve gözlerini kapatırmış. Rüzgar ağaçların arasından yumuşak bir ninni fısıldar, ırmak sakin sakin akarmış. Ayıcık derin bir nefes alır, gün boyu topladığı balları ve oynadığı oyunları hayal ederken yavaş yavaş uykuya dalarmış. Ormandaki tüm hayvanlar da birer birer uykuya dalar, orman sessiz ve huzurlu bir hal alırmış. İyi geceler küçük ayıcık, yarın yeni maceralar seni bekliyor."},
  {title:"Küçük Yıldızın Gezisi", cat:"Masal", dur:"6 dk", url:"", text:"Gökyüzünün en ucunda, en küçük yıldız arkadaşlarına bakar ve merak edermiş: acaba dünyada neler oluyor? Bir gece cesaretini toplamış ve yavaşça aşağı doğru süzülmüş. Şehirlerin ışıklarını, denizlerin dalgalarını ve uyuyan çocukların pencerelerini görmüş. Her pencerede bir çocuğun tatlı tatlı uyuduğunu fark etmiş ve içi sevgiyle dolmuş. Sabah olmadan gökyüzüne geri dönmüş ve o günden sonra her gece dünyayı izlemeye, uyuyan çocuklara ışığıyla göz kırpmaya devam etmiş."},
  {title:"Renkli Balonlar", cat:"Sesli Hikaye", dur:"4 dk", url:"", text:"Bir pazar sabahı gökyüzüne kırmızı, sarı, mavi ve yeşil balonlar salınmış. Her balon rüzgarla birlikte farklı bir yöne doğru süzülmüş. Kırmızı balon dağların üzerinden geçmiş, sarı balon güneşe selam vermiş, mavi balon bulutların arasında saklambaç oynamış. Yeşil balon ise en son, en yükseğe çıkmış ve oradan koca dünyayı gülümseyerek izlemiş. Akşam olduğunda hepsi yıldızların yanına ulaşmış ve orada, gökyüzünde sonsuza dek parıldamaya devam etmişler."},
  {title:"Ormanın Nazik Devi", cat:"Masal", dur:"7 dk", url:"", text:"Ormanın en yaşlı ağacının dibinde nazik bir dev yaşarmış. Kocaman olmasına rağmen çok yumuşak kalpliymiş; kaybolan tavşanlara yol gösterir, yuvasından düşen kuş yavrularını nazikçe geri koyarmış. Bir gece küçük bir sincap yolunu kaybetmiş ve ağlayarak dolaşırken deve rastlamış. Dev onu kocaman ama şefkatli elleriyle kaldırmış ve yuvasına kadar götürmüş. O günden sonra ormandaki tüm hayvanlar devin aslında en güvenilir dostları olduğunu anlamışlar ve her akşam ona iyi geceler dilemeye gelirlermiş."},
  {title:"Ay Işığında Uyku", cat:"Uyku Hikayesi", dur:"5 dk", url:"", text:"Ay, her gece gökyüzünde yavaşça yükselir ve dünyaya yumuşacık bir ışık saçarmış. Bu ışık, uyumakta zorlanan tüm çocukların pencerelerinden içeri süzülür ve onlara sarılırmış. Ay ışığı bir çocuğun odasına girdiğinde, odadaki her şey sakinleşir, oyuncaklar bile derin bir uykuya dalarmış. Çocuk gözlerini kapattığında ay ona usulca bir ninni mırıldanır, yıldızlar da ona eşlik edermiş. Sabah güneş doğana kadar ay hep oradaymış, sessizce, sevgiyle nöbet tutarmış."}
];
const LULLABIES_POOL = [
  {title:"Dandini Dandini", cat:"Türkçe", lyrics:"Dandini dandini danalı bebek, elleri kolları kınalı bebek. Uyusun da büyüsün minik bebeğim, tatlı rüyalarla dinlensin bebeğim. Dandini dandini dastana, danalar girmiş bostana.", url:""},
  {title:"Yağmur Sesli Ninni", cat:"Doğa Sesli", lyrics:"Yağmur damlaları usulca düşer, pencereme hafif hafif vurur. Uyu benim küçük meleğim, gece seni sarıp sarmalar. Damlalar bir ninni gibi fısıldar, sen de onlarla birlikte uykuya dal.", url:""},
  {title:"Piyano Uyku Bahçesi", cat:"Enstrümantal", lyrics:"Yavaşça çalan notalar, bir bahçede süzülür gibi. Her tuş bir yıldız, her melodi bir düş. Gözlerini kapat, notaların seni taşımasına izin ver, uykunun bahçesine doğru.", url:"/audio/piyano-uyku-bahcesi.mp3"},
  {title:"Uzayda Uyku", cat:"Enstrümantal", lyrics:"Yıldızların arasında süzülüyoruz, sessizce, yumuşacık. Ay bize göz kırpıyor, gezegenler usulca dönüyor. Sen de bu sessiz uzayda, güvenle uykuya dalabilirsin.", url:"/audio/uzayda-uyku.mp3"}
];
const MOM_HEALTH_ARTICLES = [
  {title:"Lohusalık Döneminde Bedeninizi Tanımak", cat:"Lohusalık", icon:Heart,
    body:"Doğumdan sonraki 6-8 haftalık lohusalık döneminde rahim eski boyutuna küçülür, lohusa kanaması (loşi) zamanla azalarak renk değiştirir. Bu dönemde ağır kaldırmaktan kaçının, ped kullanımına dikkat edin ve ateş, kötü kokulu akıntı veya aşırı kanama görürseniz vakit kaybetmeden doktorunuza başvurun. Vücudunuz yeniden şekillenirken kendinize karşı sabırlı olun; bu tamamen normal ve gerekli bir iyileşme sürecidir."},
  {title:"Doğum Sonrası Duygu Durumu ve Depresyon Farkındalığı", cat:"Psikoloji", icon:Brain,
    body:"Doğumdan sonraki ilk günlerde yaşanan ani ağlama, hassasiyet ve duygu iniş çıkışları 'lohusalık hüznü' olarak bilinir ve genellikle 2 hafta içinde kendiliğinden geçer. Ancak sürekli üzüntü, ilgisizlik, aşırı kaygı veya bebeğe bağ kuramama hissi 2 haftadan uzun sürüyorsa bu doğum sonrası depresyon belirtisi olabilir. Bu bir zayıflık değil, tedavi edilebilir bir durumdur — yaşadıklarınızı partnerinizle, aile hekiminizle veya bir ruh sağlığı uzmanıyla paylaşmaktan çekinmeyin."},
  {title:"Kegel Egzersizleri Nasıl Yapılır?", cat:"Egzersiz", icon:Dumbbell,
    body:"Kegel egzersizleri pelvik taban kaslarını güçlendirerek idrar kaçırmayı azaltır ve doğum sonrası toparlanmayı hızlandırır. İdrarı keser gibi pelvik taban kaslarınızı 5 saniye sıkıp 5 saniye gevşetin, bunu 10-15 tekrar halinde günde 3 kez uygulayın. Doğru kası bulmak için idrar yaparken akışı kısa süreliğine durdurmayı deneyebilirsiniz (bunu sadece kası tanımak için yapın, düzenli alışkanlık haline getirmeyin). Sezaryen veya epizyotomi sonrası egzersize başlamadan önce doktorunuza danışın."},
  {title:"Emzirme Döneminde Vitamin İhtiyacı", cat:"Vitamin", icon:Pill,
    body:"Emzirme döneminde D vitamini, kalsiyum, demir ve Omega-3 ihtiyacı artar; çoğu doktor bu dönemde de doğum öncesi vitamin desteğine devam edilmesini önerir. Bol su tüketmek süt üretimini destekler, dengeli beslenme hem sizin hem bebeğinizin enerjisini korur. Herhangi bir takviyeye başlamadan önce mutlaka doktorunuza veya diyetisyeninize danışın, kendi kendinize yüksek doz vitamin almaktan kaçının."},
  {title:"Doğum Sonrası Uyku Düzeni Kurmak", cat:"Uyku", icon:Moon,
    body:"Yeni doğan bir bebekle uyku düzeni kurmak zaman alır; bebeğinizin uyuduğu her an siz de dinlenmeye çalışın, ev işlerini ikinci plana atmaktan çekinmeyin. Mümkünse partnerinizle veya yakınlarınızla gece nöbetlerini paylaşın. Kısa 20-30 dakikalık şekerlemeler bile birikmiş yorgunluğu azaltabilir; uzun vadede düzenli uyku alışkanlığı hem sizin hem bebeğinizin ruh haline iyi gelecektir."},
  {title:"Cinsel Sağlıkta Doğum Sonrası Süreç", cat:"Cinsel Sağlık", icon:Sparkles,
    body:"Doğum sonrası cinsel yaşama dönüş için genel öneri, doktor kontrolünden sonra (genellikle 6 hafta civarı) vücudunuzun iyileşmesini beklemektir. Hormonal değişiklikler nedeniyle vajinal kuruluk ve isteksizlik yaşamak son derece normaldir, kayganlaştırıcı kullanmak yardımcı olabilir. Partnerinizle açık iletişim kurmak ve kendinize zaman tanımak bu sürecin doğal bir parçasıdır; ağrı veya kanama yaşarsanız doktorunuza danışın."}
];
const BADGES = [
  {title:"100 Gün Emzirme", icon: Heart},
  {title:"İlk Diş", icon: Smile},
  {title:"İlk Adım", icon: Activity},
  {title:"İlk Kelime", icon: MessageCircle},
  {title:"İlk Doğum Günü", icon: Star},
  {title:"1 Yaş", icon: Award},
  {title:"2 Yaş", icon: Award},
  {title:"3 Yaş", icon: Award}
];

/* ============================================================
   HELPERS
   ============================================================ */
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
const daysBetween = (a,b) => Math.floor((b - a) / (1000*60*60*24));
const todayISO = () => new Date().toISOString().slice(0,10);
function addMonthsToDate(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d;
}
function formatDateTR(d) {
  return d.toLocaleDateString("tr-TR", {day:"2-digit", month:"long", year:"numeric"});
}

/* ============================================================
   KALICI DEPOLAMA YARDIMCILARI (window.storage)
   ============================================================ */
async function storageGet(key, shared=false) {
  try {
    const res = await window.storage.get(key, shared);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value, shared=false) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
    return true;
  } catch (e) {
    return false;
  }
}

/* ============================================================
   YAKINIMDA — konum, harita ve gerçek POI (eczane / bebek mağazası)
   yardımcıları. Hiçbir API anahtarı gerektirmez:
   - Harita: OpenStreetMap embed (openstreetmap.org/export/embed.html)
   - Yakın yerler: Overpass API (overpass-api.de) — OSM verisi
   - İl/ilçe: Nominatim reverse geocoding (nominatim.openstreetmap.org)
   - Nöbetçi eczane: eczaneler.gen.tr üzerinden ilin güncel resmi listesi
   Not: Nominatim ücretsiz kullanım politikası düşük hacimli, kişisel
   kullanım için uygundur; yüksek trafikte kendi sunucunuzu kurmanız
   veya ücretli bir geocoding servisi kullanmanız önerilir.
   ============================================================ */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function trSlug(str="") {
  return String(str)
    .toLocaleLowerCase("tr")
    .replace(/ı/g,"i").replace(/İ/g,"i")
    .replace(/ğ/g,"g").replace(/ü/g,"u")
    .replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-+|-+$)/g,"");
}

async function reverseGeocodeTR(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=tr&zoom=12`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error("geocode_error");
  const data = await res.json();
  const addr = data.address || {};
  const province = addr.province || addr.state || addr.city || "";
  const district = addr.town || addr.county || addr.district || addr.suburb || "";
  return { province, district };
}

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter"
];

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  return fetch(url, {...options, signal: controller.signal}).finally(()=>clearTimeout(timer));
}

async function overpassNearby(lat, lon, radiusM, tagPairs) {
  const filters = tagPairs.map(([k,v]) =>
    `node["${k}"="${v}"](around:${radiusM},${lat},${lon});way["${k}"="${v}"](around:${radiusM},${lat},${lon});`
  ).join("\n");
  const query = `[out:json][timeout:20];(${filters});out center 20;`;

  let lastErr = null;
  for (const endpoint of OVERPASS_MIRRORS) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body: "data=" + encodeURIComponent(query)
      }, 10000);
      if (!res.ok) throw new Error("overpass_error");
      const data = await res.json();
      return (data.elements||[]).map(el => {
        const lt = el.lat ?? el.center?.lat;
        const ln = el.lon ?? el.center?.lon;
        if (lt==null || ln==null) return null;
        const tags = el.tags || {};
        const addrParts = [];
        const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(" ");
        if (street) addrParts.push(street);
        const area = tags["addr:neighbourhood"] || tags["addr:suburb"] || tags["addr:district"] || "";
        if (area) addrParts.push(area);
        if (!addrParts.length && tags["addr:full"]) addrParts.push(tags["addr:full"]);
        return {
          id: `${el.type}/${el.id}`,
          name: tags.name || tags["name:tr"] || "İsimsiz",
          lat: lt, lon: ln,
          address: addrParts.join(", "),
          phone: tags.phone || tags["contact:phone"] || ""
        };
      }).filter(Boolean);
    } catch (e) {
      lastErr = e; // bu aynada başarısız oldu, sıradaki aynayı dene
    }
  }
  throw lastErr || new Error("overpass_error");
}

/* ============================================================
   YAKINIMDA HARİTASI — Leaflet (CDN'den yüklenir), eczane/bebek
   mağazası konumlarını gerçek pin olarak gösterir. Pine tıklamak
   listedeki seçimle aynı şekilde davranır.
   ============================================================ */
function useLeaflet() {
  const [ready, setReady] = useState(typeof window !== "undefined" && !!window.L);
  useEffect(() => {
    if (ready || typeof window === "undefined") return;
    if (window.L) { setReady(true); return; }
    if (!document.getElementById("abp-leaflet-css")) {
      const link = document.createElement("link");
      link.id = "abp-leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const existing = document.getElementById("abp-leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      if (window.L) setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "abp-leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, [ready]);
  return ready;
}

function NearbyMap({coords, places, category, selectedPlace, onSelectPlace, mapView}) {
  const leafletReady = useLeaflet();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const markersRef = useRef([]);

  // Harita bir kez kurulur
  useEffect(() => {
    if (!leafletReady || !containerRef.current || mapRef.current) return;
    const L = window.L;
    const center = coords ? [coords.lat, coords.lon] : [39.0, 35.0];
    mapRef.current = L.map(containerRef.current, {attributionControl:true}).setView(center, coords?13:6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap katkıda bulunanlar"
    }).addTo(mapRef.current);
    return () => { mapRef.current && mapRef.current.remove(); mapRef.current = null; };
  }, [leafletReady]);

  // Kullanıcının konum işareti + görünüm (Türkiye / Yakın Çevre)
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = window.L;
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (coords) {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#5B4B8A;border:3px solid #fff;box-shadow:0 0 0 4px rgba(91,75,138,0.25)"></div>`,
        iconSize:[16,16], iconAnchor:[8,8]
      });
      userMarkerRef.current = L.marker([coords.lat, coords.lon], {icon, zIndexOffset:1000}).addTo(mapRef.current);
    }
    if (mapView === "country") {
      mapRef.current.setView([39.0, 35.0], 6);
    } else if (coords && !selectedPlace) {
      mapRef.current.setView([coords.lat, coords.lon], 14);
    }
  }, [leafletReady, coords, mapView]);

  // Kategoriye göre eczane/bebek mağazası pin'leri
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    const color = category === "pharmacy" ? "#B685D6" : "#79B4E0";
    const emoji = category === "pharmacy" ? "💊" : "🧸";
    (places || []).forEach(p => {
      const active = selectedPlace && selectedPlace.id === p.id;
      const size = active ? 34 : 26;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:${active?14:11}px;line-height:1;">${emoji}</span></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size]
      });
      const marker = L.marker([p.lat, p.lon], {icon}).addTo(mapRef.current);
      marker.on("click", () => onSelectPlace && onSelectPlace(p));
      markersRef.current.push(marker);
    });
  }, [leafletReady, places, category, selectedPlace]);

  // Seçilen yere odaklan
  useEffect(() => {
    if (!leafletReady || !mapRef.current || !selectedPlace) return;
    mapRef.current.setView([selectedPlace.lat, selectedPlace.lon], 16);
  }, [leafletReady, selectedPlace]);

  return (
    <div style={{position:"relative", width:"100%", height:"100%", background:"var(--card)"}}>
      <div ref={containerRef} style={{width:"100%", height:"100%"}}/>
      {!leafletReady && (
        <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink-faint)", fontSize:12}}>
          Harita yükleniyor...
        </div>
      )}
    </div>
  );
}

/* ============================================================
   UYKU SESLERİ / BEYAZ GÜRÜLTÜ — GERÇEK ÇALAN MOTOR
   Önceki sürümde bu bölüm sadece görsel state değiştiriyordu, hiçbir
   ses üretmiyordu. Artık iki yol var:
   1) noise: "white" | "pink" | "brown" → Web Audio API ile tarayıcıda
      anında ve dosyasız üretilir, sonsuz döngüde çalar.
   2) url: "https://.../ses.mp3" → gerçek bir kayıt <audio> ile çalınır.
      url boşsa (henüz dosya eklenmediyse) çalma denenmez, kullanıcıya
      toast ile bilgi verilir — sessizce "çalıyor" göstermek yerine.
   ============================================================ */
let _abpAudioCtx = null;
let _abpNoiseNode = null;
let _abpAudioEl = null;
let _abpSoundTimerId = null;

function _abpGetAudioCtx() {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!_abpAudioCtx) _abpAudioCtx = new Ctx();
  if (_abpAudioCtx.state === "suspended") _abpAudioCtx.resume();
  return _abpAudioCtx;
}

function _abpMakeNoiseBuffer(ctx, type) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === "pink") {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + white*0.0555179;
      b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520;
      b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522;
      b5 = -0.7616*b5 - white*0.0168980;
      const pink = b0+b1+b2+b3+b4+b5+b6+white*0.5362;
      b6 = white*0.115926;
      data[i] = pink * 0.11;
    }
  } else if (type === "brown") {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

// Tek bir sesi (noise veya dosya) çalmaya başlar; önce her zaman durdurur.
function playSleepSound(sound, { onAutoStop } = {}) {
  stopSleepSound();
  if (sound.noise) {
    const ctx = _abpGetAudioCtx();
    if (!ctx) { showToast("Tarayıcınız ses üretmeyi desteklemiyor", "error"); return false; }
    const buffer = _abpMakeNoiseBuffer(ctx, sound.noise);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    src.connect(gain).connect(ctx.destination);
    src.start(0);
    _abpNoiseNode = { src, gain, ctx };
    return true;
  }
  if (sound.url) {
    const el = new Audio(sound.url);
    el.loop = true;
    el.onerror = () => showToast(`"${sound.name}" ses dosyası yüklenemedi`, "error");
    el.play().catch(() => showToast("Ses çalınamadı, tekrar deneyin", "error"));
    _abpAudioEl = el;
    return true;
  }
  showToast(`"${sound.name}" için henüz bir ses dosyası eklenmedi`, "error");
  return false;
}

function stopSleepSound() {
  if (_abpSoundTimerId) { clearTimeout(_abpSoundTimerId); _abpSoundTimerId = null; }
  if (_abpNoiseNode) {
    try { _abpNoiseNode.src.stop(); } catch(e) {}
    _abpNoiseNode = null;
  }
  if (_abpAudioEl) {
    _abpAudioEl.pause();
    _abpAudioEl = null;
  }
}

// "15 dk" / "30 dk" / "1 saat" / "Sonsuz" gibi bir etiketi otomatik-durdurma
// süresine çevirir; süre dolunca sesi kapatıp onAutoStop'u tetikler.
function scheduleSleepSoundAutoStop(timerLabel, onAutoStop) {
  if (_abpSoundTimerId) { clearTimeout(_abpSoundTimerId); _abpSoundTimerId = null; }
  const map = {"15 dk":15*60000, "30 dk":30*60000, "1 saat":60*60000};
  const ms = map[timerLabel];
  if (!ms) return; // "Sonsuz" veya tanınmayan değer → otomatik durdurma yok
  _abpSoundTimerId = setTimeout(() => {
    stopSleepSound();
    if (onAutoStop) onAutoStop();
  }, ms);
}

/* ============================================================
   SESLİ OKUMA (Web Speech API) — hikayeler ve ninniler için gerçekten
   çalışan "dinle" özelliği. Ses dosyası gerektirmez, tarayıcının
   yerleşik metin-okuma motorunu kullanır.
   ============================================================ */
let _abpVoicesCache = null;
function _abpGetVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const list = window.speechSynthesis.getVoices();
  if (list && list.length) _abpVoicesCache = list;
  return _abpVoicesCache || list || [];
}
function _abpPickTurkishVoice() {
  const voices = _abpGetVoices();
  return (
    voices.find(v => v.lang && v.lang.toLowerCase() === "tr-tr") ||
    voices.find(v => v.lang && v.lang.toLowerCase().startsWith("tr")) ||
    null
  );
}

// Chrome/Android WebView, konuşma ~15 saniyeyi geçince sesi otomatik
// duraklatıyor (bilinen bir tarayıcı hatası). Bunu aşmak için konuşma
// sürerken periyodik olarak resume() çağırıyoruz.
let _abpResumeTimer = null;
function _abpStartResumeWatchdog() {
  _abpStopResumeWatchdog();
  _abpResumeTimer = setInterval(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (window.speechSynthesis.speaking) {
      // bazı tarayıcılarda uzun metinlerde motor sessizce takılabiliyor;
      // pause/resume tetiklemek konuşmayı canlı tutar.
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);
}
function _abpStopResumeWatchdog() {
  if (_abpResumeTimer) { clearInterval(_abpResumeTimer); _abpResumeTimer = null; }
}

function speakText(text, {rate=1, pitch=1, onEnd}={}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    showToast("Tarayıcınız sesli okumayı desteklemiyor", "error");
    return false;
  }
  const synth = window.speechSynthesis;
  _abpStopResumeWatchdog();
  // NOT: iOS Safari (ve bazı mobil WebView'ler) speak() çağrısını yalnızca
  // kullanıcı tıklamasıyla AYNI SENKRON İŞLEM ("call stack") içinde
  // yapıldığında sesle konuşur. Aradan bir setTimeout, Promise/await ya da
  // "voiceschanged" event bekleyişi girerse motor sessizce hiçbir şey
  // çalmaz. Bu yüzden speak() burada HER ZAMAN hemen ve senkron olarak
  // çağrılıyor; Türkçe ses (voice) henüz yüklenmemişse bile devam ediyoruz
  // (sistem varsayılan sesiyle okur; ses listesi geldikten sonraki
  // çağrılarda otomatik olarak Türkçe sese geçilir).
  synth.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "tr-TR";
  const voice = _abpPickTurkishVoice();
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = pitch;
  const finish = (err) => {
    _abpStopResumeWatchdog();
    if (err) {
      console.error("speechSynthesis hata:", err);
      showToast("Sesli okuma başlatılamadı, tekrar deneyin", "error");
    }
    if (onEnd) onEnd();
  };
  u.onend = () => finish(null);
  u.onerror = (e) => finish(e);
  try {
    synth.speak(u);
    _abpStartResumeWatchdog();
  } catch (e) {
    finish(e);
    showToast("Sesli okuma başlatılamadı, tekrar deneyin.", "error");
    return false;
  }

  // Bazı cihazlarda speak() hiçbir hata vermeden de sessiz kalabilir
  // (ör. cihaz sessiz/rehber sesi kapalıyken). Kısa bir süre sonra hâlâ
  // konuşmuyor/bekliyor değilse kullanıcıyı bilgilendiriyoruz — ama bu
  // kontrol artık speak() çağrısını GECİKTİRMİYOR, sadece geri bildirim
  // amaçlı.
  setTimeout(() => {
    if (!synth.speaking && !synth.pending) {
      showToast("Bu cihazda sesli okuma başlatılamadı. Cihazınızın sessiz modda olmadığından ve tarayıcı izinlerinden emin olun.", "error");
    }
  }, 900);

  // Ses listesi henüz yüklenmemişse (ilk kullanım), arka planda hazır
  // olmasını sağlıyoruz ki bir SONRAKİ tıklamada Türkçe ses hemen seçilsin.
  if (!_abpGetVoices().length && typeof synth.addEventListener === "function") {
    const warm = () => { synth.removeEventListener("voiceschanged", warm); };
    synth.addEventListener("voiceschanged", warm);
  }
  return true;
}
function stopSpeaking() {
  _abpStopResumeWatchdog();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/* ============================================================
   YAPAY ZEKA İLE GÜNLÜK İÇERİK ÜRETİMİ (Claude API)
   Motor/Dil/Beyin gelişimi, beslenme, doktor tavsiyesi vb. blokları artık
   sabit havuzlardan değil, ilgili günün yaşına özel olarak yapay zeka
   tarafından üretiliyor ve o gün için önbelleğe alınıyor (aynı gün tekrar
   açıldığında yeniden üretmez, "Yenile" ile zorla yeniden üretilebilir).
   ============================================================ */
async function generateAIJSON(userPrompt) {
  try {
    const system = "Sen bir Anne & Bebek uygulaması için günlük içerik üreten bir yapay zeka asistanısın. SADECE geçerli JSON nesnesi döndür — açıklama, markdown, kod bloğu işareti (```), başka hiçbir metin ekleme. Türkçe yaz. Her alan 1-2 kısa cümle olsun, sıcak ve anlaşılır bir dille. KESİNLİKLE tıbbi tanı koyma, ilaç veya doz önerme. Riskli/acil bir durumdan bahsediyorsan mutlaka doktora yönlendir. Her gün için birbirinden farklı, o güne özel, tekrara düşmeyen içerik üret.";
    const res = await callGemini(system, [{role:"user", content: userPrompt}]);
    if (!res.ok) return null;
    const cleaned = res.text.replace(/^```json\s*/i,"").replace(/^```\s*/,"").replace(/```$/,"").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

/* Günlük yapay zeka içeriğini önbellekten okuyan/üreten paylaşımlı hook.
   Aynı gün tekrar açıldığında yeniden üretmez; "regenerate" ile zorlanabilir. */
function useAIDaily(cacheKey, buildPrompt, fallback) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAI, setIsAI] = useState(false);

  // NOT: Bu içerik kullanıcıya özel değildir (herkes için aynı "bu hafta ne
  // olur" tarzı genel bilgidir), bu yüzden shared=true ile paylaşımlı
  // depoda tutulur. Böylece her benzersiz cacheKey için Gemini'ye SADECE
  // BİR KERE istek gider; sonraki tüm kullanıcılar/ziyaretler aynı
  // önbellekten okur. Bu, ücretsiz Gemini kotasını (dakikada birkaç
  // istek) aşmamak için kritik önemdedir.
  const load = async (force=false) => {
    setLoading(true);
    if (!force) {
      const cached = await storageGet(cacheKey, true);
      if (cached) { setData(cached); setIsAI(true); setLoading(false); return; }
    }
    const result = await generateAIJSON(buildPrompt());
    if (result) {
      await storageSet(cacheKey, result, true);
      setData(result); setIsAI(true);
    } else {
      setData(null); setIsAI(false);
      showToast("AI içerik üretilemedi, genel içerik gösteriliyor", "error");
    }
    setLoading(false);
  };

  useEffect(()=>{ load(false); }, [cacheKey]);

  return {data: data || fallback, loading, isAI, regenerate: ()=>load(true)};
}

/* ============================================================
   TOAST (BAŞARI / HATA BİLDİRİMİ) — global, prop-drilling yok
   ============================================================ */
const toastListeners = new Set();
function showToast(text, type="success") {
  const id = Math.random().toString(36).slice(2);
  toastListeners.forEach(fn => fn({id, text, type}));
}
function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(()=>{
    const handler = (t) => {
      setToasts(ts => [...ts, t]);
      setTimeout(()=> setToasts(ts => ts.filter(x=>x.id!==t.id)), 2600);
    };
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);
  if (toasts.length === 0) return null;
  return (
    <div style={{position:"absolute", left:0, right:0, bottom:96, display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:500, pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} className="abp-pop" style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:99,
          background: t.type==="error" ? "#E38FA6" : "var(--ink)", color:"#fff",
          fontSize:13, fontWeight:700, boxShadow:"var(--shadow)"
        }}>
          {t.type==="error" ? <AlertCircle size={15}/> : <Check size={15}/>}
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   YÜKLENİYOR / HATA / BOŞ DURUM BİLEŞENLERİ
   ============================================================ */
const SkeletonBlock = ({height=16, width="100%", radius=8, style}) => (
  <div style={{
    height, width, borderRadius:radius, background:"linear-gradient(90deg, var(--card) 25%, var(--bg) 37%, var(--card) 63%)",
    backgroundSize:"400% 100%", animation:"abp-shimmer 1.4s ease infinite", ...style
  }}/>
);
const SkeletonCard = ({lines=2}) => (
  <Card style={{marginBottom:10}}>
    <SkeletonBlock height={34} width={34} radius={17} style={{marginBottom:10}}/>
    {Array.from({length:lines}).map((_,i)=>(
      <SkeletonBlock key={i} height={11} width={i===lines-1?"55%":"85%"} style={{marginTop:8}}/>
    ))}
  </Card>
);
const SkeletonGrid = ({count=4}) => (
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
    {Array.from({length:count}).map((_,i)=> <SkeletonCard key={i}/>)}
  </div>
);
const ErrorBanner = ({text="Bir şeyler ters gitti.", onRetry}) => (
  <Card style={{marginBottom:12, display:"flex",alignItems:"center",gap:12, background:"var(--pink)"}}>
    <IconBadge icon={AlertCircle} color="pink" size={34}/>
    <div style={{flex:1,fontSize:13,fontWeight:600}}>{text}</div>
    {onRetry && <div onClick={onRetry} className="abp-tap" style={{fontSize:12.5,fontWeight:700,color:"var(--ink)"}}>Tekrar Dene</div>}
  </Card>
);

function pregnancyInfo(lmpDate) {
  const days = clamp(daysBetween(new Date(lmpDate), new Date()), 0, 279);
  const week = clamp(Math.floor(days/7)+1, 1, 40);
  const dayInWeek = days % 7;
  return { days, week, dayInWeek, data: PREGNANCY_WEEKS[week-1] };
}
function childAgeInfo(birthDate) {
  const days = clamp(daysBetween(new Date(birthDate), new Date()), 0, 365*6+40);
  const months = Math.floor(days/30.44);
  const years = Math.floor(months/12);
  const remMonths = months % 12;
  let closest = CHILD_MILESTONES[0];
  for (const m of CHILD_MILESTONES) if (m.month <= months) closest = m;
  return { days, months, years, remMonths, milestone: closest };
}

/* ============================================================
   ATOMIC UI PIECES
   ============================================================ */
const Card = ({children, style, className="", onClick}) => (
  <div
    onClick={onClick}
    className={`abp-tap ${className}`}
    style={{
      background:"var(--card)", borderRadius:"var(--radius-lg)",
      padding:18, boxShadow:"var(--shadow-sm)", ...style
    }}
  >{children}</div>
);

const SectionTitle = ({children, action}) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"22px 4px 10px"}}>
    <h3 className="abp-display" style={{fontSize:17,fontWeight:700,margin:0,color:"var(--ink)"}}>{children}</h3>
    {action}
  </div>
);

const IconBadge = ({icon:Icon, color="pink", size=42}) => (
  <div style={{
    width:size, height:size, borderRadius: size/2.6, display:"flex",
    alignItems:"center", justifyContent:"center",
    background:`var(--${color})`, flexShrink:0
  }}>
    <Icon size={size*0.46} color="var(--ink)" strokeWidth={2}/>
  </div>
);

const Pill_ = ({active, children, onClick}) => (
  <div onClick={onClick} className="abp-tap" style={{
    padding:"9px 16px", borderRadius:999, fontSize:13.5, fontWeight:600,
    background: active ? "var(--ink)" : "var(--card)",
    color: active ? "var(--white)" : "var(--ink-soft)",
    whiteSpace:"nowrap", boxShadow: active ? "none" : "var(--shadow-sm)"
  }}>{children}</div>
);

const PrimaryButton = ({children, onClick, style, disabled}) => (
  <div onClick={disabled?undefined:onClick} className="abp-tap" style={{
    background: disabled ? "var(--ink-faint)" : "linear-gradient(135deg, #E8A9C4, #B79AEA)",
    color:"#fff", textAlign:"center", padding:"16px", borderRadius:18,
    fontWeight:700, fontSize:15.5, boxShadow: disabled? "none" : "0 10px 24px -8px rgba(180,130,200,0.55)",
    ...style
  }}>{children}</div>
);

const GhostButton = ({children, onClick, style}) => (
  <div onClick={onClick} className="abp-tap" style={{
    textAlign:"center", padding:"15px", borderRadius:18, fontWeight:600, fontSize:14.5,
    color:"var(--ink)", background:"var(--card)", boxShadow:"var(--shadow-sm)", ...style
  }}>{children}</div>
);

const Modal = ({onClose, children, title}) => (
  <div style={{
    position:"fixed", inset:0, background:"rgba(30,20,40,0.45)", zIndex:200,
    display:"flex", alignItems:"flex-end"
  }} onClick={onClose}>
    <div className="abp-pop abp-scrollbar" onClick={e=>e.stopPropagation()} style={{
      background:"var(--bg)", width:"100%", maxHeight:"85%", overflowY:"auto",
      borderRadius:"28px 28px 0 0", padding:"20px 20px 34px"
    }}>
      <div style={{width:40,height:5,background:"var(--ink-faint)",borderRadius:99,margin:"0 auto 16px",opacity:0.4}}/>
      {title && <h3 className="abp-display" style={{fontSize:19,fontWeight:800,margin:"0 0 12px"}}>{title}</h3>}
      {children}
      <div onClick={onClose} className="abp-tap" style={{position:"absolute",top:16,right:16,width:32,height:32,borderRadius:16,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <X size={16}/>
      </div>
    </div>
  </div>
);

/* ============================================================
   ONBOARDING
   ============================================================ */
function Onboarding({onDone}) {
  const [idx, setIdx] = useState(0);
  const slide = ONBOARDING_SLIDES[idx];
  const Icon = slide.icon;
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"40px 26px 26px",background:"var(--bg)"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}} key={idx}>
        <div className="abp-pop" style={{
          width:132,height:132,borderRadius:44,background:`var(--${slide.color})`,
          display:"flex",alignItems:"center",justifyContent:"center",marginBottom:36
        }}>
          <Icon size={56} color="var(--ink)" strokeWidth={1.6}/>
        </div>
        <h1 className="abp-display abp-fade-up" style={{fontSize:26,fontWeight:800,margin:"0 0 12px",maxWidth:280}}>{slide.title}</h1>
        <p className="abp-fade-up" style={{fontSize:15,color:"var(--ink-soft)",lineHeight:1.6,maxWidth:280,margin:0}}>{slide.desc}</p>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,margin:"24px 0"}}>
        {ONBOARDING_SLIDES.map((_,i)=>(
          <div key={i} style={{width: i===idx?24:8, height:8, borderRadius:99, background: i===idx? "var(--ink)":"var(--ink-faint)", transition:"width .3s"}}/>
        ))}
      </div>
      {idx < ONBOARDING_SLIDES.length-1 ? (
        <PrimaryButton onClick={()=>setIdx(idx+1)}>Devam Et</PrimaryButton>
      ) : (
        <PrimaryButton onClick={onDone}>Kullanmaya Başla</PrimaryButton>
      )}
      {idx < ONBOARDING_SLIDES.length-1 && (
        <div onClick={()=>onDone()} className="abp-tap" style={{textAlign:"center",padding:"14px 0 0",fontSize:13.5,color:"var(--ink-faint)",fontWeight:600}}>Atla</div>
      )}
    </div>
  );
}

/* ============================================================
   AUTH
   ============================================================ */
function AuthScreen({onDone}) {
  const [mode, setMode] = useState("choose");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const run = async (fn) => {
    setBusy(true); setErr(null);
    try {
      const result = await fn();
      // signInWithGoogle popup engellendiğinde sayfayı Google'a yönlendirir
      // ve null döner; bu durumda sayfa zaten yeniden yükleneceği için
      // onDone() çağırmaya gerek yok (ve çağırmak yanlış ekranı gösterebilir).
      if (result !== null) onDone();
    }
    catch (e) { setErr(e.message || "Bir hata oluştu, tekrar deneyin."); }
    finally { setBusy(false); }
  };
  const runNoAdvance = async (fn) => {
    setBusy(true); setErr(null);
    try { await fn(); }
    catch (e) { setErr(e.message || "Bir hata oluştu, tekrar deneyin."); }
    finally { setBusy(false); }
  };

  if (mode === "reset") {
    return (
      <Screen title="Şifre Sıfırlama" onBack={()=>setMode("choose")}>
        <p style={{color:"var(--ink-soft)",fontSize:14,lineHeight:1.6}}>Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        <Input label="E-posta" value={email} onChange={setEmail} placeholder="ornek@eposta.com"/>
        {err && <div style={{color:"#D9526B",fontSize:12.5,marginBottom:10}}>{err}</div>}
        <PrimaryButton disabled={busy} style={{marginTop:18}} onClick={()=>runNoAdvance(async ()=>{ await resetPassword(email); setMode("choose"); showToast("Sıfırlama bağlantısı gönderildi ✓"); })}>{busy?"Gönderiliyor...":"Bağlantı Gönder"}</PrimaryButton>
      </Screen>
    );
  }
  if (mode === "email") {
    return (
      <Screen title="E-posta ile Kayıt" onBack={()=>setMode("choose")}>
        <Input label="Ad Soyad" value={name} onChange={setName} placeholder="Adınız"/>
        <Input label="E-posta" value={email} onChange={setEmail} placeholder="ornek@eposta.com"/>
        <Input label="Şifre" value={pass} onChange={setPass} placeholder="••••••••" type="password"/>
        {err && <div style={{color:"#D9526B",fontSize:12.5,marginBottom:10}}>{err}</div>}
        <PrimaryButton style={{marginTop:18}} disabled={busy||!email||!pass} onClick={()=>run(()=>registerWithEmail(name, email, pass))}>{busy?"Hesap Oluşturuluyor...":"Hesap Oluştur"}</PrimaryButton>
        <div onClick={()=>setMode("login")} className="abp-tap" style={{textAlign:"center",marginTop:14,fontSize:13.5,color:"var(--ink-soft)",fontWeight:600}}>Zaten hesabım var, giriş yap</div>
        <div onClick={()=>setMode("reset")} className="abp-tap" style={{textAlign:"center",marginTop:8,fontSize:13.5,color:"var(--ink-soft)",fontWeight:600}}>Şifremi unuttum</div>
      </Screen>
    );
  }
  if (mode === "login") {
    return (
      <Screen title="Giriş Yap" onBack={()=>setMode("choose")}>
        <Input label="E-posta" value={email} onChange={setEmail} placeholder="ornek@eposta.com"/>
        <Input label="Şifre" value={pass} onChange={setPass} placeholder="••••••••" type="password"/>
        {err && <div style={{color:"#D9526B",fontSize:12.5,marginBottom:10}}>{err}</div>}
        <PrimaryButton style={{marginTop:18}} disabled={busy||!email||!pass} onClick={()=>run(()=>signInWithEmail(email, pass))}>{busy?"Giriş yapılıyor...":"Giriş Yap"}</PrimaryButton>
        <div onClick={()=>setMode("reset")} className="abp-tap" style={{textAlign:"center",marginTop:14,fontSize:13.5,color:"var(--ink-soft)",fontWeight:600}}>Şifremi unuttum</div>
      </Screen>
    );
  }
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"32px 26px",background:"var(--bg)"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:76,height:76,borderRadius:26,background:"var(--pink)",margin:"0 auto 18px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Heart size={32} color="var(--ink)"/>
        </div>
        <h1 className="abp-display" style={{fontSize:22,fontWeight:800,margin:"0 0 6px"}}>Hoş Geldiniz</h1>
        <p style={{color:"var(--ink-soft)",fontSize:14,margin:0}}>Anne bebek yolculuğunuz burada başlıyor</p>
      </div>
      {err && <div style={{color:"#D9526B",fontSize:12.5,marginBottom:10,textAlign:"center"}}>{err}</div>}
      <GhostButton onClick={()=>run(signInWithGoogle)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
        <span style={{fontWeight:800}}>G</span> {busy?"Bağlanıyor...":"Google ile Giriş"}
      </GhostButton>
      <GhostButton onClick={()=>run(signInWithApple)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
        <AppleIcon size={17}/> Apple ile Giriş
      </GhostButton>
      <GhostButton onClick={()=>setMode("email")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:22}}>
        <Mail size={17}/> E-posta ile Kayıt Ol
      </GhostButton>
      <div onClick={()=>setMode("login")} className="abp-tap" style={{textAlign:"center",fontSize:13.5,color:"var(--ink-soft)",fontWeight:600,marginBottom:8}}>Zaten hesabım var, giriş yap</div>
      <div onClick={()=>setMode("reset")} className="abp-tap" style={{textAlign:"center",fontSize:13.5,color:"var(--ink-soft)",fontWeight:600}}>Şifremi unuttum</div>
    </div>
  );
}

const Input = ({label, value, onChange, placeholder, type="text"}) => (
  <div style={{marginBottom:14}}>
    <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:6}}>{label}</div>
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e=>onChange && onChange(e.target.value)}
      style={{
        width:"100%", padding:"14px 16px", borderRadius:16, border:"1px solid rgba(150,130,180,0.18)",
        background:"var(--card)", fontSize:14.5, color:"var(--ink)", outline:"none"
      }}
    />
  </div>
);

const Screen = ({title, onBack, children, right}) => (
  <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 100px"}} className="abp-scrollbar">
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
      {onBack && <div onClick={onBack} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><ChevronLeft size={18}/></div>}
      <h2 className="abp-display" style={{fontSize:19,fontWeight:800,margin:0,flex:1}}>{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

/* ============================================================
   SETUP WIZARD
   ============================================================ */
function SetupWizard({onDone}) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState(null); // pregnant | born
  const [lmp, setLmp] = useState("");
  const [birth, setBirth] = useState("");
  const [childName, setChildName] = useState("");
  const [children, setChildren] = useState([]);

  const addChild = () => {
    if (!childName) return;
    setChildren([...children, {id: Date.now(), name: childName, status, lmp, birth}]);
    setChildName(""); setLmp(""); setBirth(""); setStatus(null); setStep(0);
  };

  const finish = () => {
    const finalList = children.length ? children : (status ? [{id:Date.now(), name: status==="pregnant"?"Bebeğim":"Bebeğim", status, lmp, birth}] : []);
    onDone(finalList.length ? finalList : [{id:Date.now(), name:"Bebeğim", status:"pregnant", lmp: todayISO()}]);
  };

  return (
    <Screen title="İlk Kurulum">
      {step === 0 && (
        <>
          <p style={{color:"var(--ink-soft)",fontSize:14,marginBottom:18}}>Size özel deneyim hazırlayabilmemiz için birkaç soru soralım.</p>
          <Card style={{marginBottom:12}} onClick={()=>{setStatus("pregnant"); setStep(1);}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <IconBadge icon={Baby} color="pink"/>
              <div><div style={{fontWeight:700,fontSize:15}}>Hamileyim</div><div style={{fontSize:13,color:"var(--ink-soft)"}}>Son adet veya tahmini doğum tarihimi gireceğim</div></div>
            </div>
          </Card>
          <Card onClick={()=>{setStatus("born"); setStep(1);}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <IconBadge icon={Heart} color="blue"/>
              <div><div style={{fontWeight:700,fontSize:15}}>Bebeğim Doğdu</div><div style={{fontSize:13,color:"var(--ink-soft)"}}>Doğum tarihini gireceğim</div></div>
            </div>
          </Card>
          {children.length > 0 && (
            <>
              <SectionTitle>Eklenen Çocuklar</SectionTitle>
              {children.map(c=>(
                <Card key={c.id} style={{marginBottom:10}}>
                  <div style={{fontWeight:700}}>{c.name}</div>
                  <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{c.status==="pregnant"?"Hamilelik takibi":"Doğum sonrası takip"}</div>
                </Card>
              ))}
              <PrimaryButton onClick={finish}>Kuruluma Devam Et</PrimaryButton>
            </>
          )}
        </>
      )}
      {step === 1 && (
        <>
          <Input label="Çocuğun / bebeğin adı (opsiyonel)" value={childName} onChange={setChildName} placeholder="Örn. Elif"/>
          {status === "pregnant" ? (
            <Input label="Son Adet Tarihi" type="date" value={lmp} onChange={setLmp}/>
          ) : (
            <Input label="Doğum Tarihi" type="date" value={birth} onChange={setBirth}/>
          )}
          <PrimaryButton onClick={addChild} disabled={status==="pregnant" ? !lmp : !birth} style={{marginTop:6}}>Ekle ve Devam Et</PrimaryButton>
          <GhostButton onClick={finish} style={{marginTop:12}}>Birden Fazla Çocuk Eklemeden Bitir</GhostButton>
        </>
      )}
    </Screen>
  );
}

/* ============================================================
   BOTTOM NAV
   ============================================================ */
const TABS = [
  {key:"today", label:"Bugün", icon: Home},
  {key:"track", label:"Takip", icon: Activity},
  {key:"activities", label:"Etkinlik", icon: Sparkles},
  {key:"nearby", label:"Yakın", icon: MapPin},
  {key:"community", label:"Sohbet", icon: Users},
  {key:"assistant", label:"Asistan", icon: MessageCircle},
  {key:"profile", label:"Profil", icon: User}
];
function BottomNav({active, onChange}) {
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, display:"flex",
      background:"var(--card)", borderTop:"1px solid rgba(150,130,180,0.12)",
      padding:"10px 6px 18px", boxShadow:"0 -8px 24px -16px rgba(90,70,130,0.25)"
    }}>
      {TABS.map(t=>{
        const Icon = t.icon; const isActive = active===t.key;
        return (
          <div key={t.key} onClick={()=>onChange(t.key)} className="abp-tap" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0"}}>
            <div style={{width:34,height:34,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background: isActive? "var(--pink)":"transparent"}}>
              <Icon size={18} color={isActive?"var(--ink)":"var(--ink-faint)"} strokeWidth={isActive?2.2:1.8}/>
            </div>
            <div style={{fontSize:10.5,fontWeight:700,color: isActive?"var(--ink)":"var(--ink-faint)"}}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   TODAY TAB (with signature ring)
   ============================================================ */
function DayRing({percent, big, small, color}) {
  const r = 80, c = 2*Math.PI*r;
  return (
    <div style={{position:"relative", width:200, height:200, margin:"0 auto"}}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--pink)" strokeWidth="14" opacity="0.5"/>
        <circle
          cx="100" cy="100" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="14"
          strokeDasharray={c} strokeDashoffset={c - (percent/100)*c} strokeLinecap="round"
          transform="rotate(-90 100 100)"
          style={{transition:"stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)"}}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0A8C6"/>
            <stop offset="100%" stopColor="#B79AEA"/>
          </linearGradient>
        </defs>
      </svg>
      <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
        <div className="abp-display" style={{fontSize:30,fontWeight:800,lineHeight:1}}>{big}</div>
        <div style={{fontSize:12.5,color:"var(--ink-soft)",fontWeight:600,marginTop:6,textAlign:"center",maxWidth:130}}>{small}</div>
      </div>
    </div>
  );
}

function TodayTab({child, onOpenPregnancy, onOpenChild, onOpenMarket}) {
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [openCard, setOpenCard] = useState(null);

  useEffect(()=>{
    let alive = true;
    (async ()=>{
      const cmsArticles = await storageGet("cms:articles", true) || [];
      const cmsCards = cmsArticles.map((a,i)=>({icon:Sparkles, color:["purple","pink","blue","green"][i%4], title:a.title, body:a.body}));
      const merged = [...DAILY_ARTICLES_POOL, ...cmsCards].sort(()=>Math.random()-0.5);
      if (alive) { setCards(merged); setCardsLoading(false); }
    })();
    return ()=>{ alive = false; };
  }, []);

  if (!child) return <EmptyState/>;
  const isPregnant = child.status === "pregnant";
  const info = isPregnant ? pregnancyInfo(child.lmp || todayISO()) : childAgeInfo(child.birth || todayISO());

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",fontWeight:600}}>Merhaba,</div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"2px 0 0"}}>{child.name}</h2>
        </div>
        <div style={{width:40,height:40,borderRadius:20,background:"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Bell size={17}/>
        </div>
      </div>

      <div className="abp-fade-up" style={{marginTop:18}} onClick={()=> isPregnant ? onOpenPregnancy() : onOpenChild()}>
        {isPregnant ? (
          <DayRing percent={(info.week/40)*100} big={`${info.week}. Hafta`} small={`${info.dayInWeek}. gün · Bebeğiniz bugün ${info.data.fruit.toLowerCase()} büyüklüğünde 🤰`}/>
        ) : (
          <DayRing percent={clamp((info.months/72)*100,4,100)} big={`${info.years>0?`${info.years} yaş ${info.remMonths} ay`:`${info.months} aylık`}`} small={`Bebeğiniz bugün ${info.days}. gününde 👶`}/>
        )}
      </div>

      <div className="abp-fade-up abp-tap" onClick={onOpenMarket} style={{
        marginTop:18, borderRadius:"var(--radius-lg)", padding:16,
        background:"linear-gradient(120deg, #F6B8CE 0%, #E8A9C4 45%, #C6B3F0 100%)",
        display:"flex", alignItems:"center", gap:14, boxShadow:"var(--shadow-sm)", position:"relative", overflow:"hidden"
      }}>
        <div style={{width:46,height:46,borderRadius:16,background:"rgba(255,255,255,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <ShoppingBag size={22} color="#5A3B50"/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div className="abp-display" style={{fontWeight:800,fontSize:15,color:"#3A2A3B"}}>Anne Pazarı</div>
          <div style={{fontSize:12,color:"#5A3B50",marginTop:2,fontWeight:600}}>2. el bebek kıyafeti, oyuncak ve eşyaları keşfet ya da satışa çıkar</div>
        </div>
        <ChevronRight size={20} color="#5A3B50" style={{flexShrink:0}}/>
      </div>

      <SectionTitle>Bugünün Kartları</SectionTitle>
      {cardsLoading ? (
        <SkeletonGrid count={6}/>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
          {cards.map((c,i)=>{
            const Icon = c.icon;
            return (
              <Card key={i} className="abp-fade-up" style={{animationDelay:`${i*0.04}s`}} onClick={()=>setOpenCard(c)}>
                <IconBadge icon={Icon} color={c.color} size={38}/>
                <div style={{fontWeight:700,fontSize:13.5,marginTop:10}}>{c.title}</div>
                <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:4,lineHeight:1.4}}>{c.body.slice(0,46)}…</div>
              </Card>
            );
          })}
        </div>
      )}

      {openCard && (
        <Modal title={openCard.title} onClose={()=>setOpenCard(null)}>
          <IconBadge icon={openCard.icon} color={openCard.color} size={48}/>
          <p style={{fontSize:14.5,lineHeight:1.7,color:"var(--ink)",marginTop:14}}>{openCard.body}</p>
          <p style={{fontSize:12.5,color:"var(--ink-faint)"}}>İçerikler her gün otomatik olarak yenilenir.</p>
        </Modal>
      )}
    </div>
  );
}

const EmptyState = ({text="Henüz bir çocuk profili eklenmedi."}) => (
  <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,background:"var(--bg)",padding:30,textAlign:"center"}}>
    <IconBadge icon={Baby} color="pink" size={60}/>
    <div style={{fontWeight:700}}>{text}</div>
  </div>
);

/* ============================================================
   PREGNANCY DETAIL
   ============================================================ */
/* ============================================================
   GÖRSEL: GÜN GÜN BEBEK GELİŞİM İLLÜSTRASYONU — ANNE KARNI ORTAMI
   (Tıbbi/gerçekçi bir tarama görüntüsü değildir; amniyon kesesi,
   plasenta ve göbek kordonuyla birlikte anne karnı içindeki ortamı
   çağrıştıran, günden güne kademeli olarak büyüyüp detaylanan
   stilize bir sahne.)
   ============================================================ */
const PREGNANCY_STAGE_BOUNDS = [27, 49, 70, 91, 119, 154, 189, 217, 245, 280];
const PREGNANCY_STAGE_LABELS = [
  "Hücre Kümesi", "Tomurcuk Aşaması", "Embriyo", "Erken Fetüs",
  "Kıvrılmış Minik Bedeni", "Şekillenen Yüz Hatları", "Dolgunlaşan Bebek",
  "Gözlerini Açan Bebek", "Doğuma Hazırlanan Bebek", "Doğuma Hazır"
];
/* Gerçek 3D render / lisanslı illüstrasyon dosyalarınız hazır olduğunda
   buraya URL ekleyin — o aşama için otomatik olarak çizim yerine bu görsel
   gösterilir. Örnek: PREGNANCY_STAGE_IMAGES[6] = "https://.../trimester3.png"; */
const PREGNANCY_STAGE_IMAGES = [null, null, null, null, null, null, null, null, null, null];
const CHILD_STAGE_BOUNDS = [21, 90, 180, 300, 450, 730, 1460, 2190];
const CHILD_STAGE_LABELS = [
  "Kundaktaki Yenidoğan", "Baş Tutan Bebek", "Destekle Oturan Bebek",
  "Emekleyen Bebek", "Tutunarak Yürüyen Bebek", "Bağımsız Yürüyen Çocuk",
  "Koşan Meraklı Çocuk", "Enerjik Okul Öncesi Çocuk"
];
const CHILD_STAGE_IMAGES = [null, null, null, null, null, null, null, null];

function pregnancyStageIndex(day) {
  let i = PREGNANCY_STAGE_BOUNDS.findIndex(b => day <= b);
  return i === -1 ? PREGNANCY_STAGE_BOUNDS.length - 1 : i;
}
function childStageIndex(day) {
  let i = CHILD_STAGE_BOUNDS.findIndex(b => day <= b);
  return i === -1 ? CHILD_STAGE_BOUNDS.length - 1 : i;
}

/* ============================================================
   TEMİZ, DÜZ (FLAT) İLLÜSTRASYON KARAKTER SİSTEMİ
   Gerçekçi 3D render değil — bilinçli olarak sade, tutarlı, "app-icon"
   kalitesinde düz illüstrasyon (Peanut / Ovia tarzı). Kollar/bacaklar
   yuvarlak uçlu kalın çizgiler (kapsül), tek düz ten rengi + tek gölge
   tonu. Karmaşık gradyan/blur yok — bu yüzden net ve profesyonel durur.
   ============================================================ */
const SKIN = "#F6B994";
const SKIN_SHADOW = "#E39B6C";
const HAIR = "#8A5C3B";
const BLUSH = "#F0899A";

const CharDefs = () => (
  <defs>
    <filter id="groundShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
);
const GroundShadow = ({cx, cy, rx=34, ry=8}) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#2A2036" opacity="0.16" filter="url(#groundShadow)"/>
);
/* limb: yuvarlak uçlu kalın kapsül çizgi */
const Limb = ({x1,y1,x2,y2,w=13,color=SKIN}) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round"/>
);
const Face = ({cx, cy, closed, size=1}) => (
  <g>
    {closed ? (
      <>
        <path d={`M ${cx-8*size},${cy} Q ${cx-4*size},${cy-3*size} ${cx*size},${cy}`} stroke="#6B4A38" strokeWidth={1.6*size} fill="none" strokeLinecap="round" transform={`translate(${cx*0},0)`}/>
      </>
    ) : (
      <>
        <circle cx={cx-7*size} cy={cy} r={2.1*size} fill="#4A3428"/>
        <circle cx={cx+7*size} cy={cy} r={2.1*size} fill="#4A3428"/>
      </>
    )}
    <path d={`M ${cx-5*size},${cy+7*size} Q ${cx},${cy+10*size} ${cx+5*size},${cy+7*size}`} stroke="#C97A55" strokeWidth={1.4*size} fill="none" strokeLinecap="round"/>
    <ellipse cx={cx-13*size} cy={cy+4*size} rx={3.4*size} ry={2.2*size} fill={BLUSH} opacity="0.55"/>
    <ellipse cx={cx+13*size} cy={cy+4*size} rx={3.4*size} ry={2.2*size} fill={BLUSH} opacity="0.55"/>
  </g>
);
const HairTuft = ({cx, cy, size=1}) => (
  <path d={`M ${cx-6*size},${cy} Q ${cx},${cy-11*size} ${cx+6*size},${cy}`} stroke={HAIR} strokeWidth={4.4*size} fill="none" strokeLinecap="round"/>
);

const StageImage = ({src, label}) => (
  <div style={{position:"relative", width:210, height:210, margin:"0 auto"}}>
    <div style={{width:196, height:196, margin:"7px auto 0", borderRadius:"50%", overflow:"hidden", boxShadow:"0 16px 32px -10px rgba(60,40,90,0.4)", border:"3px solid var(--card)"}}>
      <img src={src} alt={label} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    </div>
    <div style={{textAlign:"center", marginTop:8, fontSize:12.5, fontWeight:700, color:"var(--ink-soft)"}}>{label}</div>
  </div>
);

/* ============================================================
   BABYVISUAL — anne karnı ortamı
   ============================================================ */
const WOMB_SAC_PATH = "M 105,10 C 148,10 182,32 192,72 C 202,112 196,152 168,178 C 140,204 110,204 84,198 C 50,190 20,168 12,132 C 4,96 14,58 44,34 C 64,18 84,10 105,10 Z";
const AMNIOTIC_BUBBLES = [
  {cx:38, cy:60, r:3.4}, {cx:168, cy:52, r:2.6}, {cx:176, cy:120, r:3.8},
  {cx:150, cy:172, r:2.4}, {cx:36, cy:150, r:3}, {cx:60, cy:186, r:2.2},
  {cx:24, cy:100, r:2.6}, {cx:180, cy:88, r:2.2}
];
const CURLED_BABY_PATH = "M -2,-38 C 18,-40 32,-24 28,-8 C 32,-2 29,10 19,14 C 23,21 17,31 5,29 C 9,37 -1,42 -10,36 C -21,41 -29,31 -23,22 C -32,17 -31,4 -21,1 C -31,-8 -27,-23 -12,-29 C -8,-35 -6,-38 -2,-38 Z";

function BabyVisual({day}) {
  const stage = pregnancyStageIndex(day);
  const scale = 0.22 + 0.85 * clamp(day/279, 0, 1);
  const label = PREGNANCY_STAGE_LABELS[stage];
  const customImg = PREGNANCY_STAGE_IMAGES[stage];
  if (customImg) return <StageImage src={customImg} label={label}/>;
  return (
    <div style={{position:"relative", width:210, height:210, margin:"0 auto"}}>
      <svg viewBox="0 0 210 210" width="210" height="210">
        <defs>
          <radialGradient id="wombGrad" cx="40%" cy="32%" r="72%">
            <stop offset="0%" stopColor="var(--pink)" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="var(--purple-deep)" stopOpacity="0.6"/>
          </radialGradient>
        </defs>
        <CharDefs/>

        <path d={WOMB_SAC_PATH} fill="url(#wombGrad)"/>
        <path d={WOMB_SAC_PATH} fill="none" stroke="var(--purple-deep)" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round" opacity="0.5"/>
        {AMNIOTIC_BUBBLES.map((b,i)=>(
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="var(--card)" opacity="0.35"/>
        ))}

        {/* plasenta ve göbek kordonu */}
        <ellipse cx="46" cy="42" rx="19" ry="13" fill="var(--pink-deep)" opacity="0.5" transform="rotate(-18 46 42)"/>
        <path d={`M 50,50 Q 78,${70+scale*4} 90,${96+scale*8} Q 100,${112+scale*10} 105,${118+scale*14}`} stroke="var(--ink-faint)" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.5"/>

        <g transform={`translate(105 118) scale(${scale.toFixed(3)})`} style={{transition:"transform .5s cubic-bezier(.2,.8,.2,1)"}}>
          {stage === 0 && (
            <g fill={SKIN} opacity="0.95">
              <circle r="9"/>
              <circle cx="12" cy="-7" r="4.5" opacity="0.75"/>
              <circle cx="-10" cy="8" r="4.5" opacity="0.75"/>
              <circle cx="5" cy="14" r="3.6" opacity="0.6"/>
            </g>
          )}
          {stage === 1 && (
            <g fill={SKIN}>
              <path d="M -6,-30 C 20,-32 30,-6 18,9 C 9,20 -8,22 -18,11 C -27,2 -25,-13 -16,-22 C -12,-26 -9,-30 -6,-30 Z"/>
              <ellipse cx="-8" cy="10" rx="4" ry="9" fill={SKIN_SHADOW} opacity="0.7"/>
            </g>
          )}
          {stage === 2 && (
            <g fill={SKIN}>
              <circle cx="0" cy="-19" r="15"/>
              <ellipse cx="0" cy="11" rx="15" ry="20"/>
              <Limb x1="-2" y1="4" x2="-20" y2="14" w="8"/>
              <Limb x1="2" y1="4" x2="18" y2="10" w="8"/>
              <Limb x1="-4" y1="26" x2="-14" y2="38" w="9"/>
              <Limb x1="4" y1="26" x2="13" y2="38" w="9"/>
              <ellipse cx="6" cy="-20" rx="7" ry="12" fill={SKIN_SHADOW} opacity="0.35"/>
            </g>
          )}
          {stage === 3 && (
            <g fill={SKIN}>
              <circle cx="0" cy="-21" r="17"/>
              <ellipse cx="0" cy="14" rx="17" ry="22"/>
              <Limb x1="-2" y1="4" x2="-24" y2="16" w="9"/>
              <Limb x1="2" y1="4" x2="22" y2="12" w="9"/>
              <Limb x1="-5" y1="30" x2="-16" y2="44" w="10"/>
              <Limb x1="5" y1="30" x2="15" y2="44" w="10"/>
              <ellipse cx="7" cy="-22" rx="8" ry="13" fill={SKIN_SHADOW} opacity="0.32"/>
              <Face cx="-2" cy="-22" closed size="0.85"/>
            </g>
          )}
          {stage >= 4 && (
            <g>
              <path d={CURLED_BABY_PATH} fill={SKIN}/>
              <path d="M 5,-30 C 18,-20 24,-2 16,14 C 22,10 27,-6 20,-20 C 16,-27 10,-30 5,-30 Z" fill={SKIN_SHADOW} opacity="0.4"/>
              <Face cx="6" cy="-22" closed={stage < 7} size="0.95"/>
              {stage >= 7 && <circle cx="24" cy="-4" r="3.6" fill={SKIN} stroke={SKIN_SHADOW} strokeWidth="0.6"/>}
              {stage >= 8 && <circle cx="20" cy="27" r="4.2" fill={SKIN} stroke={SKIN_SHADOW} strokeWidth="0.6"/>}
              <circle cx="-1" cy="0" r={2.4+stage*0.14} fill="#E38FA6" opacity="0.85" className="abp-heartbeat"/>
            </g>
          )}
        </g>
      </svg>
      <div style={{textAlign:"center", marginTop:2, fontSize:12.5, fontWeight:700, color:"var(--ink-soft)"}}>{label}</div>
    </div>
  );
}

/* ============================================================
   CHILDVISUAL — doğum sonrası, gerçek dünya sahnesi
   ============================================================ */
function ChildVisual({day}) {
  const stage = childStageIndex(day);
  const scale = 0.6 + 0.52 * clamp(day/2190, 0, 1);
  const label = CHILD_STAGE_LABELS[stage];
  const customImg = CHILD_STAGE_IMAGES[stage];
  if (customImg) return <StageImage src={customImg} label={label}/>;
  const onesie = ["#F0A8C6","#A9C9F2","#B7E0C6","#F2C98A"][stage%4];
  return (
    <div style={{position:"relative", width:210, height:210, margin:"0 auto"}}>
      <svg viewBox="0 0 210 210" width="210" height="210">
        <defs>
          <radialGradient id="roomGrad" cx="42%" cy="26%" r="85%">
            <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.65"/>
          </radialGradient>
        </defs>
        <CharDefs/>

        <circle cx="105" cy="105" r="96" fill="url(#roomGrad)"/>
        <circle cx="105" cy="105" r="96" fill="none" stroke="var(--blue-deep)" strokeWidth="1.6" strokeDasharray="1 6" opacity="0.4"/>
        <circle cx="166" cy="40" r="13" fill="#FBD98A" opacity="0.85"/>
        <path d="M 14,150 Q 105,132 196,150 L 196,201 L 14,201 Z" fill="var(--card)" opacity="0.4"/>
        <path d="M 14,150 Q 105,132 196,150" stroke="var(--blue-deep)" strokeWidth="1.4" fill="none" opacity="0.4"/>
        <GroundShadow cx="105" cy="176" rx={26+stage*3}/>
        {stage >= 3 && <circle cx="42" cy="166" r="6" fill="var(--pink-deep)" opacity="0.5"/>}
        {stage >= 3 && <circle cx="170" cy="172" r="4.5" fill="var(--purple-deep)" opacity="0.5"/>}

        <g transform={`translate(105 128) scale(${scale.toFixed(3)})`} style={{transition:"transform .5s cubic-bezier(.2,.8,.2,1)"}}>
          {stage === 0 && (
            <g>
              <ellipse cx="0" cy="14" rx="20" ry="26" fill={onesie}/>
              <ellipse cx="0" cy="14" rx="20" ry="26" fill="#fff" opacity="0.12"/>
              <circle cx="-4" cy="-22" r="16" fill={SKIN}/>
              <ellipse cx="4" cy="-16" rx="6" ry="10" fill={SKIN_SHADOW} opacity="0.28"/>
              <Face cx="-6" cy="-22" closed size="0.9"/>
            </g>
          )}
          {stage === 1 && (
            <g>
              <ellipse cx="0" cy="18" rx="19" ry="23" fill={onesie}/>
              <Limb x1="-14" y1="6" x2="-24" y2="20" w="9"/>
              <Limb x1="14" y1="6" x2="24" y2="20" w="9"/>
              <circle cx="0" cy="-17" r="16" fill={SKIN}/>
              <ellipse cx="7" cy="-11" rx="6" ry="10" fill={SKIN_SHADOW} opacity="0.26"/>
              <Face cx="0" cy="-17"/>
              <HairTuft cx="0" cy="-32"/>
            </g>
          )}
          {stage === 2 && (
            <g>
              <ellipse cx="0" cy="27" rx="23" ry="17" fill={onesie}/>
              <Limb x1="-18" y1="20" x2="-30" y2="34" w="10"/>
              <Limb x1="18" y1="20" x2="30" y2="34" w="10"/>
              <Limb x1="-10" y1="40" x2="-15" y2="50" w="11"/>
              <Limb x1="10" y1="40" x2="15" y2="50" w="11"/>
              <circle cx="0" cy="-12" r="17" fill={SKIN}/>
              <ellipse cx="7" cy="-6" rx="6.5" ry="11" fill={SKIN_SHADOW} opacity="0.26"/>
              <Face cx="0" cy="-12"/>
              <HairTuft cx="0" cy="-28"/>
            </g>
          )}
          {stage === 3 && (
            <g>
              <Limb x1="-14" y1="24" x2="-30" y2="24" w="12"/>
              <Limb x1="14" y1="24" x2="30" y2="24" w="12"/>
              <Limb x1="-9" y1="40" x2="-20" y2="52" w="12"/>
              <Limb x1="9" y1="40" x2="20" y2="52" w="12"/>
              <ellipse cx="0" cy="26" rx="20" ry="16" fill={onesie}/>
              <circle cx="0" cy="-6" r="17" fill={SKIN}/>
              <ellipse cx="7" cy="0" rx="6.5" ry="11" fill={SKIN_SHADOW} opacity="0.26"/>
              <Face cx="0" cy="-6"/>
              <HairTuft cx="0" cy="-22"/>
            </g>
          )}
          {stage === 4 && (
            <g>
              <Limb x1="-11" y1="16" x2="-22" y2="4" w="10"/>
              <Limb x1="11" y1="16" x2="24" y2="24" w="10"/>
              <Limb x1="-7" y1="42" x2="-14" y2="60" w="11"/>
              <Limb x1="7" y1="42" x2="16" y2="60" w="11"/>
              <ellipse cx="0" cy="18" rx="16" ry="24" fill={onesie}/>
              <circle cx="0" cy="-24" r="16" fill={SKIN}/>
              <ellipse cx="6" cy="-18" rx="6" ry="10" fill={SKIN_SHADOW} opacity="0.26"/>
              <Face cx="0" cy="-24"/>
              <HairTuft cx="0" cy="-39"/>
            </g>
          )}
          {stage >= 5 && (
            <g>
              <Limb x1="-9" y1="14" x2={stage>=6?"-22":"-19"} y2={stage>=6?"-2":"4"} w="10"/>
              <Limb x1="9" y1="14" x2={stage>=6?"24":"20"} y2={stage>=6?"6":"6"} w="10"/>
              <Limb x1="-6" y1="42" x2={stage>=7?"-18":"-12"} y2="62" w="11"/>
              <Limb x1="6" y1="42" x2={stage>=7?"16":"12"} y2="62" w="11"/>
              <ellipse cx="0" cy="16" rx="15" ry="26" fill={onesie}/>
              <circle cx="0" cy="-26" r="15.5" fill={SKIN}/>
              <ellipse cx="6" cy="-20" rx="5.8" ry="9.5" fill={SKIN_SHADOW} opacity="0.26"/>
              <Face cx="0" cy="-26"/>
              <HairTuft cx="0" cy="-40"/>
              {stage >= 7 && <HairTuft cx="7" cy="-38" size="0.7"/>}
            </g>
          )}
        </g>
      </svg>
      <div style={{textAlign:"center", marginTop:2, fontSize:12.5, fontWeight:700, color:"var(--ink-soft)"}}>{label}</div>
    </div>
  );
}


function PregnancyDetail({child, onBack}) {
  const realInfo = pregnancyInfo(child.lmp || todayISO());
  // day = gebeliğin kaçıncı günü; bugünün gerçek günüyle başlar, her gün otomatik ilerler.
  const [day, setDay] = useState(realInfo.days);
  const isToday = day === realInfo.days;
  const week = clamp(Math.floor(day/7)+1, 1, 40);
  const dayInWeek = day % 7;
  const d = PREGNANCY_WEEKS[week-1];

  const aiPregnancy = useAIDaily(
    `aiPregnancy:${child.id}:${day}`,
    ()=>`Hamileliğin ${day+1}. günü (${week}. hafta, ${dayInWeek}. gün). Şu tam JSON formatında, bu güne özel içerik üret: {"babyDev":"bebek gelişimi bilgisi","momChanges":"anne vücudundaki değişimler","dos":"yapılması gerekenler","donts":"yapılmaması gerekenler","doctor":"doktor önerisi","tip":"mini ipucu"}`,
    {babyDev: d.babyDev, momChanges: d.momChanges, dos: d.dos, donts: d.donts, doctor: d.doctor, tip: d.tip}
  );

  return (
    <Screen title="Hamilelik Takibi" onBack={onBack}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div onClick={()=>setDay(v=>clamp(v-1,0,279))} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><ChevronLeft size={18}/></div>
        <div style={{textAlign:"center"}}>
          <div className="abp-display" style={{fontSize:19,fontWeight:800}}>{week}. Hafta · {dayInWeek}. Gün</div>
          <div style={{fontSize:12,color:"var(--ink-soft)"}}>{isToday ? "Bugün · içerik her gün otomatik yenilenir" : "Geçmiş/gelecek gün önizlemesi"}</div>
        </div>
        <div onClick={()=>setDay(v=>clamp(v+1,0,279))} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><ChevronRight size={18}/></div>
      </div>
      {!isToday && (
        <div onClick={()=>setDay(realInfo.days)} className="abp-tap" style={{textAlign:"center",fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:10}}>Bugüne dön</div>
      )}

      <Card style={{marginBottom:14, textAlign:"center", padding:"22px 16px"}}>
        <div style={{fontSize:13, color:"var(--ink-soft)", fontWeight:600}}>Bebeğiniz bugün yaklaşık</div>
        <div className="abp-display" style={{fontSize:22, fontWeight:800, margin:"4px 0"}}>{d.fruit} büyüklüğünde</div>
        <div style={{fontSize:12.5, color:"var(--ink-faint)"}}>{d.length} · {d.weight}</div>
      </Card>

      <div style={{display:"flex",gap:10}}>
        <Card style={{flex:1,textAlign:"center"}}><Ruler size={18} style={{margin:"0 auto 6px"}}/><div style={{fontWeight:700}}>{d.length}</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Boy</div></Card>
        <Card style={{flex:1,textAlign:"center"}}><Weight size={18} style={{margin:"0 auto 6px"}}/><div style={{fontWeight:700}}>{d.weight}</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Kilo</div></Card>
      </div>

      <InfoBlock icon={CalendarDays} color="pink" title={`${day+1}. Gün — Bugün Ne Oluyor?`} text={pregnancyDayNote(day, week, dayInWeek, d)} highlight/>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,marginBottom:2}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,fontWeight:700,color: aiPregnancy.isAI?"#8A6FD6":"var(--ink-faint)"}}>
          <Sparkles size={13}/> {aiPregnancy.loading?"Yapay zeka içerik üretiyor...":aiPregnancy.isAI?"Yapay zeka tarafından bugüne özel üretildi":"Genel içerik gösteriliyor"}
        </div>
        {!aiPregnancy.loading && (
          <div onClick={aiPregnancy.regenerate} className="abp-tap" style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)"}}>↻ Yenile</div>
        )}
      </div>
      {aiPregnancy.loading ? (
        <><SkeletonCard/><SkeletonCard/><SkeletonCard/></>
      ) : (
        <>
          <InfoBlock icon={Baby} color="pink" title="Bebek Gelişimi" text={aiPregnancy.data.babyDev}/>
          <InfoBlock icon={Heart} color="purple" title="Anne Vücudundaki Değişimler" text={aiPregnancy.data.momChanges}/>
          <InfoBlock icon={Check} color="green" title="Yapılması Gerekenler" text={aiPregnancy.data.dos}/>
          <InfoBlock icon={X} color="pink" title="Yapılmaması Gerekenler" text={aiPregnancy.data.donts}/>
          <InfoBlock icon={Stethoscope} color="blue" title="Doktor Önerisi" text={aiPregnancy.data.doctor}/>
          <InfoBlock icon={Sparkles} color="purple" title="Mini İpucu" text={aiPregnancy.data.tip}/>
        </>
      )}

      <SectionTitle>Doktor Notlarım</SectionTitle>
      <DoctorNotes childId={child.id}/>
    </Screen>
  );
}
const InfoBlock = ({icon:Icon, color, title, text, highlight}) => (
  <Card style={{marginTop:12, border: highlight ? "1.5px solid var(--pink-deep)" : undefined}}>
    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
      <IconBadge icon={Icon} color={color} size={36}/>
      <div style={{flex:1}}>
        <div style={{fontWeight:700,fontSize:14}}>{title}</div>
        <div style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6,marginTop:4}}>{text}</div>
      </div>
    </div>
  </Card>
);

/* Doktorunuzun söylediklerini not almak için kalıcı bir alan */
function DoctorNotes({childId}) {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const key = `doctorNotes:${childId}`;

  const load = async () => {
    setLoading(true); setError(null);
    const saved = await storageGet(key, false);
    setNotes(saved || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const save = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    const note = {text:text.trim(), date:new Date().toLocaleDateString("tr-TR"), ts:Date.now()};
    const list = [note, ...notes];
    const ok = await storageSet(key, list, false);
    if (ok) { setNotes(list); setText(""); showToast("Not kaydedildi ✓"); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = notes.filter(n=>n.ts!==ts);
    setNotes(list);
    await storageSet(key, list, false);
    showToast("Not silindi");
  };

  return (
    <div>
      <Card>
        <textarea placeholder="Doktorunuzun söylediklerini buraya not alın (ör. sonraki kontrol tarihi, önerdiği vitamin, dikkat edilmesi gerekenler)..."
          value={text} onChange={e=>setText(e.target.value)} rows={3}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10,resize:"vertical",fontFamily:"inherit"}}/>
        <PrimaryButton onClick={save} disabled={!text.trim()||saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Notu Kaydet"}</PrimaryButton>
      </Card>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <div style={{marginTop:10}}><SkeletonCard lines={1}/></div>
      ) : notes.length === 0 ? (
        <Card style={{marginTop:10,textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz not eklenmedi. Bir sonraki kontrolünüzden sonra buraya not alabilirsiniz.</Card>
      ) : notes.map((n,i)=>(
        <Card key={n.ts||i} className="abp-fade-up" style={{marginTop:10,display:"flex",gap:10,alignItems:"flex-start"}}>
          <IconBadge icon={Stethoscope} color="blue" size={34}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13.5,lineHeight:1.6}}>{n.text}</div>
            <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:4}}>{n.date}</div>
          </div>
          <div onClick={()=>remove(n.ts)} className="abp-tap" style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><X size={12} color="var(--ink-faint)"/></div>
        </Card>
      ))}
    </div>
  );
}


/* ============================================================
   CHILD DEVELOPMENT DETAIL + GROWTH CHART
   ============================================================ */
function ChildDetail({child, onBack}) {
  const realInfo = childAgeInfo(child.birth || todayISO());
  // day = kaç günlük olduğu; varsayılan bugünün gerçek günü, her gün otomatik ilerler.
  // Kullanıcı istediği zaman geçmiş/gelecek günlere de göz atabilir.
  const [day, setDay] = useState(realInfo.days);
  const isToday = day === realInfo.days;

  const months = Math.floor(day/30.44);
  const years = Math.floor(months/12);
  const remMonths = months % 12;
  let milestone = CHILD_MILESTONES[0];
  for (const m of CHILD_MILESTONES) if (m.month <= months) milestone = m;

  /* Boy/Kilo/Baş Çevresi artık gün değiştikçe otomatik hesaplanmıyor —
     anne tarafından manuel girilir ve kalıcı olarak saklanır. */
  const growthKey = `growth:${child.id}`;
  const [growthLoading, setGrowthLoading] = useState(true);
  const [manualGrowth, setManualGrowth] = useState(null);
  const [editingGrowth, setEditingGrowth] = useState(false);
  const [gH, setGH] = useState("");
  const [gW, setGW] = useState("");
  const [gC, setGC] = useState("");
  useEffect(()=>{
    (async ()=>{
      const saved = await storageGet(growthKey, false);
      const defaultHeadCirc = +(34.5 + Math.min(realInfo.days,730)/730*13).toFixed(1);
      const val = saved || {height: growthAtDay(realInfo.days).height, weight: growthAtDay(realInfo.days).weight, headCirc: defaultHeadCirc};
      setManualGrowth(val); setGH(String(val.height)); setGW(String(val.weight)); setGC(String(val.headCirc||defaultHeadCirc));
      setGrowthLoading(false);
    })();
  }, [child.id]);
  const saveGrowth = async () => {
    const h = parseFloat(String(gH).replace(",", "."));
    const w = parseFloat(String(gW).replace(",", "."));
    const c = parseFloat(String(gC).replace(",", "."));
    if (!h || !w) { showToast("Geçerli bir boy ve kilo girin", "error"); return; }
    const val = {height:h, weight:w, headCirc: c || null, updatedAt:Date.now()};
    const ok = await storageSet(growthKey, val, false);
    if (ok) { setManualGrowth(val); setEditingGrowth(false); showToast("Boy/kilo/baş çevresi kaydedildi ✓"); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
  };

  const sleepTip = BABY_SLEEP_TIPS[day % BABY_SLEEP_TIPS.length];
  const dayNote = childDayNote(day, months, milestone);

  const ageLabel = years>0 ? `${years} yaş ${remMonths} ay` : `${months} aylık`;
  const aiChild = useAIDaily(
    `aiChild:${child.id}:${day}`,
    ()=>`${child.name} adlı bebek/çocuk için ${day}. gün (${ageLabel}). Şu tam JSON formatında, bu güne özel içerik üret: {"motor":"motor gelişim bilgisi","language":"dil gelişimi bilgisi","brain":"beyin gelişimi bilgisi","feeding":"bugünkü beslenme önerisi","doctor":"doktor tavsiyesi","mom":"anne önerisi","toy":"oyuncak önerisi"}`,
    {motor: milestone.motor, language: milestone.language, brain: milestone.brain,
     feeding: BABY_FEEDING_TIPS[day % BABY_FEEDING_TIPS.length], doctor: BABY_DOCTOR_TIPS[day % BABY_DOCTOR_TIPS.length],
     mom: BABY_MOM_TIPS[day % BABY_MOM_TIPS.length], toy: BABY_TOY_TIPS[day % BABY_TOY_TIPS.length]}
  );

  const growthData = useMemo(()=> Array.from({length:12}, (_,i)=>{
    const g = growthAtDay(i*30);
    return { month:`${i+1}A`, boy:g.height, p50:+(50+i*2.2).toFixed(1), p3:+(48+i*1.9).toFixed(1), p97:+(52+i*2.5).toFixed(1) };
  }), []);

  const [playingSound, setPlayingSound] = useState(null);
  const [soundTimer, setSoundTimer] = useState("30 dk");
  const quickSounds = SLEEP_SOUNDS.slice(0,6); // Beyaz, Kahverengi, Pembe Gürültü, Rahim Sesi, Kalp Atışı, Yağmur

  return (
    <Screen title="Gelişim Takibi" onBack={onBack}>
      <Card style={{marginBottom:10,display:"flex",alignItems:"center",gap:14}}>
        <IconBadge icon={Baby} color="blue" size={48}/>
        <div>
          <div style={{fontWeight:800,fontSize:16}}>{child.name}</div>
          <div style={{fontSize:13,color:"var(--ink-soft)"}}>{years>0?`${years} yaş ${remMonths} ay`:`${months} aylık`} · {day}. gün</div>
        </div>
      </Card>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div onClick={()=>setDay(d=>clamp(d-1,0,2190))} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><ChevronLeft size={18}/></div>
        <div style={{textAlign:"center"}}>
          <div className="abp-display" style={{fontSize:18,fontWeight:800}}>{day}. Gün</div>
          <div style={{fontSize:12,color:"var(--ink-soft)"}}>{isToday ? "Bugün · içerik her gün otomatik yenilenir" : "Geçmiş/gelecek gün önizlemesi"}</div>
        </div>
        <div onClick={()=>setDay(d=>clamp(d+1,0,2190))} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><ChevronRight size={18}/></div>
      </div>
      {!isToday && (
        <div onClick={()=>setDay(realInfo.days)} className="abp-tap" style={{textAlign:"center",fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:14}}>Bugüne dön</div>
      )}

      {growthLoading ? (
        <div style={{display:"flex",gap:10}}><SkeletonCard lines={1}/><SkeletonCard lines={1}/></div>
      ) : (
        <>
          <div style={{display:"flex",gap:10}}>
            <Card style={{flex:1,textAlign:"center"}}><Ruler size={18} style={{margin:"0 auto 6px"}}/><div style={{fontWeight:700}}>{manualGrowth.height} cm</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Boy</div></Card>
            <Card style={{flex:1,textAlign:"center"}}><Weight size={18} style={{margin:"0 auto 6px"}}/><div style={{fontWeight:700}}>{manualGrowth.weight} kg</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Kilo</div></Card>
            <Card style={{flex:1,textAlign:"center"}}><Activity size={18} style={{margin:"0 auto 6px"}}/><div style={{fontWeight:700}}>{manualGrowth.headCirc ? `${manualGrowth.headCirc} cm` : "—"}</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Baş Çevresi</div></Card>
          </div>
          <div onClick={()=>setEditingGrowth(true)} className="abp-tap" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12,fontWeight:700,color:"var(--ink-soft)",marginTop:8}}><Edit3 size={13}/> Boy/Kilo/Baş Çevresi Güncelle</div>
        </>
      )}
      {editingGrowth && (
        <Modal title="Boy, Kilo & Baş Çevresi Güncelle" onClose={()=>setEditingGrowth(false)}>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:12}}>Bu değerler artık günler arasında gezinirken otomatik değişmez — sadece kontrolde ölçtüğünüzde güncelleyin.</div>
          <input placeholder="Boy (cm)" value={gH} onChange={e=>setGH(e.target.value)} inputMode="decimal"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          <input placeholder="Kilo (kg)" value={gW} onChange={e=>setGW(e.target.value)} inputMode="decimal"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          <input placeholder="Baş Çevresi (cm, opsiyonel)" value={gC} onChange={e=>setGC(e.target.value)} inputMode="decimal"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={saveGrowth}>Kaydet</PrimaryButton>
        </Modal>
      )}

      <InfoBlock icon={CalendarDays} color="blue" title={`${day}. Gün — Bugün Ne Oluyor?`} text={dayNote} highlight/>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,marginBottom:2}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,fontWeight:700,color: aiChild.isAI?"#8A6FD6":"var(--ink-faint)"}}>
          <Sparkles size={13}/> {aiChild.loading?"Yapay zeka içerik üretiyor...":aiChild.isAI?"Yapay zeka tarafından bugüne özel üretildi":"Genel içerik gösteriliyor"}
        </div>
        {!aiChild.loading && (
          <div onClick={aiChild.regenerate} className="abp-tap" style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)"}}>↻ Yenile</div>
        )}
      </div>
      {aiChild.loading ? (
        <><SkeletonCard/><SkeletonCard/><SkeletonCard/></>
      ) : (
        <>
          <InfoBlock icon={Dumbbell} color="pink" title="Motor Gelişim" text={aiChild.data.motor}/>
          <InfoBlock icon={MessageCircle} color="blue" title="Dil Gelişimi" text={aiChild.data.language}/>
          <InfoBlock icon={Brain} color="purple" title="Beyin Gelişimi" text={aiChild.data.brain}/>
          <InfoBlock icon={Utensils} color="green" title="Bugünkü Beslenme" text={aiChild.data.feeding}/>
          <InfoBlock icon={Stethoscope} color="blue" title="Doktor Tavsiyesi" text={aiChild.data.doctor}/>
          <InfoBlock icon={Heart} color="pink" title="Anne Önerisi" text={aiChild.data.mom}/>
          <InfoBlock icon={Sparkles} color="purple" title="Oyuncak Önerisi" text={aiChild.data.toy}/>
        </>
      )}

      <SectionTitle>Bugünkü Uyku Önerisi</SectionTitle>
      <Card>
        <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:14}}>
          <IconBadge icon={MoonIcon} color="green" size={36}/>
          <div style={{fontSize:13,color:"var(--ink-soft)",lineHeight:1.6}}>{sleepTip}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {quickSounds.map((s,i)=>{
            const Icon = s.icon; const active = playingSound === s.name;
            return (
              <div key={i} onClick={()=>{
                if (active) { stopSleepSound(); setPlayingSound(null); return; }
                const ok = playSleepSound(s, {onAutoStop:()=>setPlayingSound(null)});
                if (ok) { setPlayingSound(s.name); scheduleSleepSoundAutoStop(soundTimer, ()=>setPlayingSound(null)); }
              }} className="abp-tap" style={{
                textAlign:"center", padding:"10px 6px", borderRadius:14,
                background: active ? "var(--green)" : "var(--bg)"
              }}>
                <Icon size={18} style={{margin:"0 auto 4px"}}/>
                <div style={{fontSize:10.5,fontWeight:700}}>{s.name}</div>
              </div>
            );
          })}
        </div>
        {playingSound && (
          <div style={{marginTop:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div onClick={()=>{ stopSleepSound(); setPlayingSound(null); }} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Pause size={14} color="#fff"/>
              </div>
              <div style={{fontSize:13,fontWeight:700}}>{playingSound} çalıyor</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {["15 dk","30 dk","1 saat","Sonsuz"].map(t=>(
                <Pill_ key={t} active={soundTimer===t} onClick={()=>{ setSoundTimer(t); scheduleSleepSoundAutoStop(t, ()=>setPlayingSound(null)); }}>{t}</Pill_>
              ))}
            </div>
          </div>
        )}
      </Card>

      <SectionTitle>Boy Uzunluğu (WHO Persentil)</SectionTitle>
      <Card>
        <div style={{fontSize:12,color:"var(--ink-soft)",marginBottom:8}}>Bu grafik WHO referans persentil eğrisidir; güncel boy/kilonuzu yukarıdan manuel girin ✓</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,130,180,0.15)"/>
            <XAxis dataKey="month" tick={{fontSize:11}} stroke="var(--ink-faint)"/>
            <YAxis tick={{fontSize:11}} stroke="var(--ink-faint)" width={30}/>
            <Tooltip contentStyle={{borderRadius:12, fontSize:12}}/>
            <Line type="monotone" dataKey="p3" stroke="#D8CDEF" strokeWidth={1.5} dot={false} name="P3"/>
            <Line type="monotone" dataKey="p97" stroke="#D8CDEF" strokeWidth={1.5} dot={false} name="P97"/>
            <Line type="monotone" dataKey="p50" stroke="#C6B3F0" strokeWidth={1.5} dot={false} name="P50" strokeDasharray="4 3"/>
            <Line type="monotone" dataKey="boy" stroke="#E8A9C4" strokeWidth={3} dot={{r:3}} name={child.name}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Screen>
  );
}

/* ============================================================
   TRACK TAB
   ============================================================ */
function TrackTab({child}) {
  const isPregnant = child?.status === "pregnant";
  const [sub, setSub] = useState(isPregnant ? "kilo" : "emzirme");
  const [logs, setLogs] = useState({emzirme:[], mama:[], uyku:[], bez:[], kilo:[], tekme:[], kasilma:[]});

  const addLog = (type, entry) => setLogs(prev => ({...prev, [type]: [entry, ...prev[type]]}));

  const subTabs = isPregnant ? [
    {key:"kilo", label:"Kilo Takibi"},
    {key:"tekme", label:"Bebek Tekmesi"},
    {key:"kasilma", label:"Kasılma Takibi"},
    {key:"randevu", label:"Randevu Takvimi"},
    {key:"uyku", label:"Uyku"}
  ] : [
    {key:"emzirme", label:"Emzirme"},
    {key:"mama", label:"Mama"},
    {key:"beslenme", label:"Yemek Listesi"},
    {key:"uyku", label:"Uyku"},
    {key:"bez", label:"Bez"},
    {key:"kaka", label:"Kaka Takibi"},
    {key:"dis", label:"Diş Çıkarma"},
    {key:"asi", label:"Aşı Takvimi"},
    {key:"ekgida", label:"Ek Gıda"}
  ];

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>Takip</h2>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {subTabs.map(t => <Pill_ key={t.key} active={sub===t.key} onClick={()=>setSub(t.key)}>{t.label}</Pill_>)}
      </div>

      {isPregnant && sub === "kilo" && (
        <TrackerBoard
          title="Kilo Takibi" color="purple" icon={Weight}
          fields={["Kilo (kg)"]}
          onLog={(vals)=>addLog("kilo",{...vals, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.kilo}
          renderLog={(l)=>`${l.time} · ${l["Kilo (kg)"]||0} kg`}
        />
      )}
      {isPregnant && sub === "tekme" && (
        <KickCounter logs={logs.tekme} onLog={(entry)=>addLog("tekme",entry)}/>
      )}
      {isPregnant && sub === "kasilma" && (
        <ContractionTimer logs={logs.kasilma} onLog={(entry)=>addLog("kasilma",entry)}/>
      )}
      {isPregnant && sub === "randevu" && <AppointmentList/>}

      {sub === "emzirme" && (
        <TrackerBoard
          title="Emzirme Takibi" color="pink" icon={Heart}
          fields={["Sağ Göğüs","Sol Göğüs"]}
          onLog={(vals)=>addLog("emzirme",{...vals, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.emzirme}
          renderLog={(l)=>`${l.time} · ${l["Sağ Göğüs"]||0} dk sağ / ${l["Sol Göğüs"]||0} dk sol`}
        />
      )}
      {sub === "mama" && (
        <TrackerBoard
          title="Mama & Sıvı Takibi" color="blue" icon={Utensils}
          fields={["Mama (ml)","Anne Sütü (ml)","Su (ml)"]}
          onLog={(vals)=>addLog("mama",{...vals, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.mama}
          renderLog={(l)=>`${l.time} · Mama ${l["Mama (ml)"]||0}ml, Anne Sütü ${l["Anne Sütü (ml)"]||0}ml, Su ${l["Su (ml)"]||0}ml`}
        />
      )}
      {sub === "uyku" && (
        <TrackerBoard
          title="Uyku Takibi" color="purple" icon={MoonIcon}
          fields={["Süre (dk)"]}
          onLog={(vals)=>addLog("uyku",{...vals, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.uyku}
          renderLog={(l)=>`${l.time} · ${l["Süre (dk)"]||0} dakika uyudu`}
          extra={
            <Card style={{marginTop:14}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:8}}>Haftalık Uyku Grafiği</div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={[10,9,11,8,10.5,12,9.5].map((v,i)=>({d:`G${i+1}`,v}))}>
                  <defs><linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C6B3F0" stopOpacity={0.6}/><stop offset="100%" stopColor="#C6B3F0" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="d" tick={{fontSize:10}} stroke="var(--ink-faint)"/>
                  <YAxis hide/>
                  <Tooltip contentStyle={{borderRadius:12,fontSize:12}}/>
                  <Area type="monotone" dataKey="v" stroke="#B79AEA" fill="url(#sleepGrad)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          }
        />
      )}
      {sub === "bez" && (
        <TrackerBoard
          title="Bez Takibi" color="green" icon={Droplets}
          fields={[]}
          customButtons={["Çiş","Kaka","İkisi"]}
          onLog={(vals)=>addLog("bez",{type:vals.type, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.bez}
          renderLog={(l)=>`${l.time} · ${l.type}`}
        />
      )}
      {sub === "beslenme" && <FoodLogSection childId={child?.id}/>}
      {sub === "kaka" && <PoopTrackerSection childId={child?.id}/>}
      {sub === "dis" && <TeethingSection childId={child?.id}/>}
      {sub === "asi" && <VaccineList child={child}/>}
      {sub === "ekgida" && <WeaningCalendar childId={child?.id}/>}
    </div>
  );
}

function TrackerBoard({title,color,icon:Icon,fields,onLog,logs,renderLog,customButtons,extra}) {
  const [vals, setVals] = useState({});
  const [note, setNote] = useState("");
  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Icon} color={color} size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>{title}</div>
        </div>
        {customButtons ? (
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {customButtons.map(b=>(
              <div key={b} onClick={()=>{onLog({type:b}); showToast(`${b} kaydedildi ✓`);}} className="abp-tap" style={{flex:1,textAlign:"center",padding:"12px 0",borderRadius:14,background:"var(--"+color+")",fontWeight:700,fontSize:13}}>{b}</div>
            ))}
          </div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns: fields.length>1?"1fr 1fr":"1fr", gap:10, marginBottom:10}}>
              {fields.map(f=>(
                <input key={f} placeholder={f} value={vals[f]||""} onChange={e=>setVals({...vals,[f]:e.target.value})}
                  style={{padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none"}}/>
              ))}
            </div>
            <input placeholder="Not ekle (opsiyonel)" value={note} onChange={e=>setNote(e.target.value)}
              style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
            <PrimaryButton onClick={()=>{onLog({...vals, not:note}); setVals({}); setNote(""); showToast("Kaydedildi ✓");}} style={{padding:12,fontSize:14}}>Kaydet</PrimaryButton>
          </>
        )}
      </Card>
      {extra}
      <SectionTitle>Geçmiş Kayıtlar</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok. İlk kaydını ekle!</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{renderLog(l)}</Card>
      ))}
    </div>
  );
}

function KickCounter({logs, onLog}) {
  const [count, setCount] = useState(0);
  const [startTime] = useState(()=> new Date());
  const elapsedMin = Math.max(0, Math.round((Date.now() - startTime.getTime())/60000));
  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Baby} color="pink" size={36}/>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Bebek Tekmesi Sayacı</div>
            <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Genelde 2 saat içinde 10 hareket beklenir</div>
          </div>
        </div>
        <div style={{textAlign:"center",padding:"18px 0"}}>
          <div className="abp-display" style={{fontSize:44,fontWeight:800}}>{count}</div>
          <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{elapsedMin} dk içinde sayılan hareket</div>
        </div>
        <div onClick={()=>setCount(c=>c+1)} className="abp-tap" style={{
          width:96,height:96,borderRadius:48,margin:"0 auto",background:"linear-gradient(135deg, #E8A9C4, #B79AEA)",
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 24px -8px rgba(180,130,200,0.55)"
        }}>
          <Plus size={34} color="#fff"/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <GhostButton style={{flex:1,padding:12,fontSize:13}} onClick={()=>setCount(0)}>Sıfırla</GhostButton>
          <PrimaryButton style={{flex:1,padding:12,fontSize:13}} onClick={()=>{
            onLog({count, minutes:elapsedMin, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})});
            setCount(0);
            showToast("Tekme sayımı kaydedildi ✓");
          }}>Kaydet</PrimaryButton>
        </div>
      </Card>
      <SectionTitle>Geçmiş Kayıtlar</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok. İlk sayımını kaydet!</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{l.time} · {l.count} hareket · {l.minutes} dk içinde</Card>
      ))}
    </div>
  );
}

function ContractionTimer({logs, onLog}) {
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const lastEndRef = useRef(null);
  useEffect(()=>{
    if (!running) return;
    const id = setInterval(()=> setElapsed(Math.round((Date.now()-startedAt)/1000)), 1000);
    return ()=>clearInterval(id);
  }, [running, startedAt]);
  const start = ()=>{ setStartedAt(Date.now()); setElapsed(0); setRunning(true); };
  const stop = ()=>{
    const durationSec = Math.round((Date.now()-startedAt)/1000);
    const now = Date.now();
    const intervalMin = lastEndRef.current ? Math.round((now-lastEndRef.current)/60000) : null;
    lastEndRef.current = now;
    onLog({durationSec, intervalMin, time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})});
    setRunning(false);
    showToast("Kasılma kaydedildi ✓");
  };
  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Timer} color="blue" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>Kasılma Takibi</div>
        </div>
        <div style={{textAlign:"center",padding:"14px 0"}}>
          <div className="abp-display" style={{fontSize:40,fontWeight:800}}>{String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}</div>
          <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{running ? "Kasılma sürüyor…" : "Kasılma başladığında butona basın"}</div>
        </div>
        {running ? (
          <div onClick={stop} className="abp-tap" style={{textAlign:"center",padding:16,borderRadius:18,background:"#E38FA6",color:"#fff",fontWeight:700}}>Kasılma Bitti</div>
        ) : (
          <div onClick={start} className="abp-tap" style={{textAlign:"center",padding:16,borderRadius:18,background:"var(--ink)",color:"#fff",fontWeight:700}}>Kasılma Başladı</div>
        )}
      </Card>
      <div style={{fontSize:12,color:"var(--ink-faint)",margin:"10px 4px"}}>Kasılmalar 5 dakikadan sık, 1 dakikadan uzun sürüyorsa doğum kliniğinizi arayın.</div>
      <SectionTitle>Geçmiş Kayıtlar</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok.</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{l.time} · {l.durationSec} sn sürdü{l.intervalMin!=null?` · önceki kasılmadan ${l.intervalMin} dk sonra`:""}</Card>
      ))}
    </div>
  );
}

const PREGNANCY_APPOINTMENTS = [
  {week:"8-10. Hafta", name:"İlk Gebelik Muayenesi"},
  {week:"11-14. Hafta", name:"İkili Tarama Testi + NT Ultrason"},
  {week:"16-18. Hafta", name:"Rutin Kontrol"},
  {week:"18-22. Hafta", name:"Detaylı Anomali Ultrasonu"},
  {week:"24-28. Hafta", name:"Şeker Yükleme Testi (OGTT)"},
  {week:"28. Hafta", name:"Üçlü/Dörtlü Tarama + Rh Kontrolü"},
  {week:"32. Hafta", name:"Büyüme Ultrasonu"},
  {week:"36. Hafta", name:"B Grubu Streptokok Testi"},
  {week:"36-40. Hafta", name:"Haftalık Rutin Kontroller"},
  {week:"40. Hafta", name:"Doğum Değerlendirmesi"}
];
/* ============================================================
   ADMIN / CMS PANELİ — paylaşımlı depolama (window.storage, shared=true)
   Not: Bu, tüm bu artifact'ı kullanan kişiler arasında paylaşılan basit
   bir içerik havuzudur; gerçek kullanıcı rolleri veya güvenlik sağlamaz.
   ============================================================ */
function CMSEditor({storageKey, fields, renderItem, addLabel="Ekle", emptyText="Henüz içerik eklenmedi."}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    const saved = await storageGet(storageKey, true);
    setItems(saved || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [storageKey]);

  const add = async () => {
    if (fields.some(f=>f.required && !vals[f.key])) { showToast("Zorunlu alanları doldurun", "error"); return; }
    setSaving(true);
    const item = {id: Math.random().toString(36).slice(2), ...vals};
    const list = [item, ...items];
    const ok = await storageSet(storageKey, list, true);
    if (ok) { setItems(list); setVals({}); showToast("İçerik eklendi ✓"); }
    else { showToast("Eklenemedi, tekrar deneyin", "error"); }
    setSaving(false);
  };
  const remove = async (id) => {
    const list = items.filter(i=>i.id!==id);
    setItems(list);
    await storageSet(storageKey, list, true);
    showToast("İçerik silindi");
  };

  return (
    <div style={{marginTop:14}}>
      <Card>
        {fields.map(f=>(
          <input key={f.key} placeholder={f.label+(f.required?" *":"")} value={vals[f.key]||""} onChange={e=>setVals({...vals,[f.key]:e.target.value})}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        ))}
        <PrimaryButton onClick={add} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?"Ekleniyor...":addLabel}</PrimaryButton>
      </Card>
      <SectionTitle>Paylaşımlı İçerik ({items.length})</SectionTitle>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : items.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{emptyText}</Card>
      ) : items.map(item=>(
        <Card key={item.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>{renderItem(item)}</div>
          <div onClick={()=>remove(item.id)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
        </Card>
      ))}
    </div>
  );
}

const ADMIN_TABS = [
  {key:"articles", label:"Makaleler"},
  {key:"activities", label:"Aktiviteler"},
  {key:"sounds", label:"Uyku Sesleri"},
  {key:"lullabies", label:"Ninniler"}
];
/* ============================================================
   TAKVİM — doktor randevuları, aşılar ve önemli tarihleri eklemek,
   düzenlemek ve silmek için kalıcı (window.storage) bir takvim.
   ============================================================ */
const CALENDAR_TYPES = [
  {key:"doktor", label:"Doktor Randevusu", icon:Stethoscope, color:"pink"},
  {key:"asi", label:"Aşı", icon:Syringe, color:"blue"},
  {key:"vitamin", label:"Vitamin/İlaç", icon:Pill, color:"green"},
  {key:"diger", label:"Diğer", icon:Star, color:"purple"}
];
function CalendarDetail({onBack}) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00");
  const [type, setType] = useState("doktor");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("calendar:events", false);
    setEvents(saved || []);
    setLoading(false);
  })(); }, []);

  const persist = async (list) => {
    setEvents(list);
    await storageSet("calendar:events", list, false);
  };

  const addEvent = async () => {
    if (!title.trim() || !date || saving) return;
    setSaving(true);
    const ev = {id: Date.now(), title: title.trim(), date, time, type, note: note.trim()};
    const list = [...events, ev].sort((a,b)=> (a.date+a.time).localeCompare(b.date+b.time));
    const ok = await storageSet("calendar:events", list, false);
    if (ok) {
      setEvents(list); setTitle(""); setNote(""); setTime("10:00"); setShowAdd(false);
      showToast("Takvime eklendi ✓");
    } else showToast("Eklenemedi, tekrar deneyin", "error");
    setSaving(false);
  };

  const removeEvent = (id) => persist(events.filter(e=>e.id!==id));

  const todayStr = todayISO();
  const upcoming = events.filter(e=>e.date >= todayStr);
  const past = events.filter(e=>e.date < todayStr);

  return (
    <Screen title="Takvim" onBack={onBack}>
      <PrimaryButton onClick={()=>setShowAdd(true)} style={{marginBottom:18,padding:14,fontSize:14}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Plus size={16}/> Randevu / Etkinlik Ekle</span>
      </PrimaryButton>

      {loading ? (
        <><SkeletonCard/><SkeletonCard/></>
      ) : events.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz bir randevu veya etkinlik eklenmedi.</Card>
      ) : (
        <>
          <SectionTitle>Yaklaşanlar</SectionTitle>
          {upcoming.length === 0 && <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Yaklaşan bir kayıt yok.</Card>}
          {upcoming.map(ev=>{
            const meta = CALENDAR_TYPES.find(t=>t.key===ev.type) || CALENDAR_TYPES[3];
            return (
              <Card key={ev.id} className="abp-fade-up" style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <IconBadge icon={meta.icon} color={meta.color} size={40}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{ev.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{new Date(ev.date+"T00:00:00").toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"})} · {ev.time}</div>
                  {ev.note && <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:3}}>{ev.note}</div>}
                </div>
                <div onClick={()=>removeEvent(ev.id)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
              </Card>
            );
          })}
          {past.length > 0 && (
            <>
              <SectionTitle>Geçmiş</SectionTitle>
              {past.slice().reverse().map(ev=>{
                const meta = CALENDAR_TYPES.find(t=>t.key===ev.type) || CALENDAR_TYPES[3];
                return (
                  <Card key={ev.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,opacity:0.55}}>
                    <IconBadge icon={meta.icon} color={meta.color} size={34}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{ev.title}</div>
                      <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{new Date(ev.date+"T00:00:00").toLocaleDateString("tr-TR")} · {ev.time}</div>
                    </div>
                    <div onClick={()=>removeEvent(ev.id)} className="abp-tap" style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={12} color="var(--ink-faint)"/></div>
                  </Card>
                );
              })}
            </>
          )}
        </>
      )}

      {showAdd && (
        <Modal title="Yeni Randevu / Etkinlik" onClose={()=>setShowAdd(false)}>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10}} className="abp-scrollbar">
            {CALENDAR_TYPES.map(t=><Pill_ key={t.key} active={type===t.key} onClick={()=>setType(t.key)}>{t.label}</Pill_>)}
          </div>
          <input placeholder="Başlık (örn. Kadın Doğum Kontrolü)" value={title} onChange={e=>setTitle(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:10}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
              style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          </div>
          <input placeholder="Not (opsiyonel)" value={note} onChange={e=>setNote(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={addEvent} disabled={!title.trim()||!date||saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Takvime Ekle"}</PrimaryButton>
        </Modal>
      )}
    </Screen>
  );
}

function AdminPanel({onBack}) {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("articles");

  if (!unlocked) {
    return (
      <Screen title="Yönetici Paneli" onBack={onBack}>
        <Card>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>Demo Yönetici Girişi</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>Bu bir demo geçiş koduyla korunur (0000), gerçek kimlik doğrulama içermez.</div>
          <input placeholder="Geçiş kodu" value={code} onChange={e=>setCode(e.target.value)} type="password"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={()=>{ if(code==="0000"){ setUnlocked(true); showToast("Giriş yapıldı ✓"); } else { showToast("Kod hatalı","error"); } }}>Giriş Yap</PrimaryButton>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Yönetici Paneli" onBack={onBack}>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {ADMIN_TABS.map(t=><Pill_ key={t.key} active={tab===t.key} onClick={()=>setTab(t.key)}>{t.label}</Pill_>)}
      </div>

      {tab === "articles" && (
        <CMSEditor
          storageKey="cms:articles"
          addLabel="Makale Ekle"
          fields={[{key:"title",label:"Başlık",required:true},{key:"body",label:"İçerik metni",required:true}]}
          renderItem={(a)=>(<><div style={{fontWeight:700,fontSize:13.5}}>{a.title}</div><div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{a.body}</div></>)}
        />
      )}
      {tab === "activities" && (
        <CMSEditor
          storageKey="cms:activities"
          addLabel="Aktivite Ekle"
          fields={[{key:"title",label:"Başlık",required:true},{key:"skill",label:"Geliştirdiği beceri",required:true},{key:"duration",label:"Süre (örn. 15 dk)"},{key:"materials",label:"Malzeme"}]}
          renderItem={(a)=>(<><div style={{fontWeight:700,fontSize:13.5}}>{a.title}</div><div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{a.skill}</div></>)}
        />
      )}
      {tab === "sounds" && (
        <CMSEditor
          storageKey="cms:sounds"
          addLabel="Uyku Sesi Ekle"
          fields={[{key:"name",label:"Ses adı",required:true}]}
          renderItem={(s)=>(<div style={{fontWeight:700,fontSize:13.5}}>{s.name}</div>)}
        />
      )}
      {tab === "lullabies" && (
        <CMSEditor
          storageKey="cms:lullabies"
          addLabel="Ninni Ekle"
          fields={[{key:"title",label:"Başlık",required:true},{key:"cat",label:"Kategori"}]}
          renderItem={(l)=>(<><div style={{fontWeight:700,fontSize:13.5}}>{l.title}</div><div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{l.cat}</div></>)}
        />
      )}
    </Screen>
  );
}

function AppointmentList() {
  return (
    <div style={{marginTop:16}}>
      <SectionTitle>Gebelik Kontrol Takvimi</SectionTitle>
      {PREGNANCY_APPOINTMENTS.map((a,i)=>(
        <Card key={i} style={{marginBottom:10, display:"flex",alignItems:"center",gap:14}}>
          <IconBadge icon={Stethoscope} color={i<3?"green":"blue"} size={38}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14}}>{a.name}</div>
            <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{a.week}</div>
          </div>
          <div style={{fontSize:11.5,fontWeight:700,color: i<3?"#5FAE7D":"var(--ink-faint)"}}>{i<3?"Tamamlandı":"Yaklaşıyor"}</div>
        </Card>
      ))}
    </div>
  );
}

function VaccineList({child}) {
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState({}); // { [index]: "2025-03-01" }
  const key = `vaccines:${child?.id||"default"}`;
  const birth = child?.birth || todayISO();

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      const saved = await storageGet(key, false);
      setDone(saved || {});
      setLoading(false);
    })();
  }, [key]);

  const markDone = async (i, dateVal) => {
    const list = {...done, [i]: dateVal};
    setDone(list);
    await storageSet(key, list, false);
    showToast("Tamamlandı olarak işaretlendi ✓");
  };
  const unmark = async (i) => {
    const list = {...done};
    delete list[i];
    setDone(list);
    await storageSet(key, list, false);
    showToast("Yaklaşıyor olarak işaretlendi");
  };

  const today = new Date();

  return (
    <div style={{marginTop:16}}>
      <SectionTitle>Türkiye Aşı Takvimi</SectionTitle>
      <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>
        {child?.name||"Çocuğunuzun"} doğum tarihine ({new Date(birth).toLocaleDateString("tr-TR")}) göre her aşının yapılması gereken tarih otomatik hesaplanır. Yapıldığında karta dokunup tarihini kaydedin — genel bir rehberdir, aile hekiminizin önerdiği program esastır.
      </div>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : VACCINE_SCHEDULE.map((v,i)=>{
        const dueDate = addMonthsToDate(birth, v.ageMonths);
        const isDone = !!done[i];
        const isOverdue = !isDone && dueDate < today;
        const daysUntil = daysBetween(today, dueDate);
        const status = isDone ? "Tamamlandı" : isOverdue ? "Gecikti" : daysUntil<=14 ? "Yaklaşıyor" : "Planlandı";
        const statusColor = isDone ? "#5FAE7D" : isOverdue ? "#D98BA6" : daysUntil<=14 ? "#C99A4A" : "var(--ink-faint)";
        return (
          <VaccineCard key={i} v={v} dueDate={dueDate} isDone={isDone} doneDate={done[i]} status={status} statusColor={statusColor}
            onMark={(dateVal)=>markDone(i, dateVal)} onUnmark={()=>unmark(i)}/>
        );
      })}
    </div>
  );
}

function VaccineCard({v, dueDate, isDone, doneDate, status, statusColor, onMark, onUnmark}) {
  const [editing, setEditing] = useState(false);
  const [dateVal, setDateVal] = useState(doneDate || todayISO());
  return (
    <Card style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:14}} onClick={()=>{ if(!isDone) setEditing(e=>!e); }} className="abp-tap">
        <IconBadge icon={isDone?Check:Syringe} color={isDone?"green":"blue"} size={38}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14}}>{v.name}</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{v.ageMonths===0?"Doğumda":`${v.ageMonths}. Ay`} · Planlanan: {formatDateTR(dueDate)}</div>
          {isDone && doneDate && <div style={{fontSize:11.5,color:"#5FAE7D",marginTop:2}}>Yapıldı: {new Date(doneDate).toLocaleDateString("tr-TR")}</div>}
        </div>
        <div style={{fontSize:11.5,fontWeight:700,color:statusColor}}>{status}</div>
      </div>
      {isDone && (
        <div onClick={onUnmark} className="abp-tap" style={{fontSize:11.5,fontWeight:700,color:"var(--ink-faint)",marginTop:10,textAlign:"right"}}>Geri Al</div>
      )}
      {!isDone && editing && (
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(150,130,180,0.15)",display:"flex",gap:8,alignItems:"center"}}>
          <input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)}
            style={{flex:1,padding:"10px 12px",borderRadius:12,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13,outline:"none"}}/>
          <div onClick={()=>{onMark(dateVal); setEditing(false);}} className="abp-tap" style={{padding:"10px 16px",borderRadius:12,background:"var(--ink)",color:"#fff",fontWeight:700,fontSize:12.5}}>Kaydet</div>
        </div>
      )}
    </Card>
  );
}

const WEANING_REACTIONS = [
  {key:"iyi", label:"Sorun Yok, Sevdi", color:"green"},
  {key:"begenmedi", label:"Beğenmedi", color:"blue"},
  {key:"hafif", label:"Hafif Reaksiyon", color:"purple"},
  {key:"kacinilmali", label:"Kaçınılmalı / Alerji", color:"pink"}
];

function WeaningCalendar({childId}) {
  const [day, setDay] = useState(1);
  const food = WEANING_FOODS[(day-1) % WEANING_FOODS.length];
  const gramMultiplier = day <= 10 ? 1 : day <= 20 ? 1.5 : 2;
  return (
    <div style={{marginTop:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div onClick={()=>setDay(d=>clamp(d-1,1,30))} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={16}/></div>
        <div style={{fontWeight:800}} className="abp-display">Ek Gıda · {day}. Gün</div>
        <div onClick={()=>setDay(d=>clamp(d+1,1,30))} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={16}/></div>
      </div>
      <Card>
        <IconBadge icon={Utensils} color="green" size={44}/>
        <div style={{fontWeight:800,fontSize:16,marginTop:10}}>{food.name}</div>
        <div style={{fontSize:13,color:"var(--ink-soft)",marginTop:4}}>Önerilen miktar: {gramMultiplier}x porsiyon ({food.gram})</div>
      </Card>
      <InfoBlock icon={BookOpen} color="blue" title="Nasıl Hazırlanır?" text={food.prep}/>
      <InfoBlock icon={AlertCircle} color="pink" title="Alerji Belirtileri" text="Kızarıklık, döküntü, kusma veya huzursuzluk görülürse besini kesip doktorunuza danışın."/>
      <InfoBlock icon={Sparkles} color="purple" title="Alternatif Besin" text={food.alt}/>
      <SectionTitle>Verilmemesi Gerekenler</SectionTitle>
      <Card>
        {AVOID_FOODS.map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",fontSize:13.5}}><X size={14} color="#D98BA6"/> {f}</div>
        ))}
      </Card>

      <WeaningLogSection childId={childId} defaultFood={food.name}/>
    </div>
  );
}

/* Bugün neler verildi? — ek gıdaya başlayan bebekler için detaylı,
   kalıcı besin tanıtım günlüğü. Her kayıt bir tepki etiketi taşır,
   böylece hangi besinlerin tolere edildiği zamanla görülebilir. */
function WeaningLogSection({childId, defaultFood}) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [foodName, setFoodName] = useState("");
  const [amount, setAmount] = useState("");
  const [reaction, setReaction] = useState("iyi");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const key = `weaninglog:${childId||"default"}`;

  const load = async () => {
    setLoading(true);
    const saved = await storageGet(key, false);
    setEntries(saved || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const add = async () => {
    const name = (foodName || defaultFood || "").trim();
    if (!name || saving) return;
    setSaving(true);
    const entry = {food:name, amount:amount.trim(), reaction, note:note.trim(), date:new Date().toLocaleDateString("tr-TR"), time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...entries];
    const ok = await storageSet(key, list, false);
    if (ok) { setEntries(list); setFoodName(""); setAmount(""); setNote(""); setReaction("iyi"); showToast("Ek gıda günlüğüne eklendi ✓"); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = entries.filter(e=>e.ts!==ts);
    setEntries(list);
    await storageSet(key, list, false);
    showToast("Kayıt silindi");
  };

  const watchList = entries.filter(e=>e.reaction==="hafif" || e.reaction==="kacinilmali");

  return (
    <div style={{marginTop:20}}>
      <SectionTitle>Bugün Neler Verildi?</SectionTitle>
      <Card>
        <input placeholder={`Örn. ${defaultFood || "Havuç Püresi"}`} value={foodName} onChange={e=>setFoodName(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder="Miktar (opsiyonel, ör. 2 tatlı kaşığı)" value={amount} onChange={e=>setAmount(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <div style={{fontSize:12,color:"var(--ink-soft)",marginBottom:8}}>Tepkisi nasıldı?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {WEANING_REACTIONS.map(r=>(
            <div key={r.key} onClick={()=>setReaction(r.key)} className="abp-tap" style={{
              padding:"10px 6px",borderRadius:12,textAlign:"center",fontWeight:700,fontSize:12,
              background: reaction===r.key ? "var(--ink)" : `var(--${r.color})`,
              color: reaction===r.key ? "#fff" : "var(--ink)"
            }}>{r.label}</div>
          ))}
        </div>
        <input placeholder="Not ekle (opsiyonel)" value={note} onChange={e=>setNote(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <PrimaryButton onClick={add} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Günlüğe Ekle"}</PrimaryButton>
      </Card>

      {watchList.length > 0 && (
        <InfoBlock icon={AlertCircle} color="pink" highlight
          title="Takip Edilmesi Gereken Besinler"
          text={`${watchList.map(w=>w.food).join(", ")} için hafif reaksiyon/kaçınma notu var. Bu besinleri tekrar vermeden önce doktorunuza danışın.`}/>
      )}

      <SectionTitle>Geçmiş Kayıtlar</SectionTitle>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : entries.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok. Bugün verdiğin ilk besini ekle!</Card>
      ) : entries.slice(0,12).map(e=>{
        const r = WEANING_REACTIONS.find(x=>x.key===e.reaction) || {};
        return (
          <Card key={e.ts} style={{marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{fontWeight:700,fontSize:13.5}}>{e.food}</div>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--ink)",background:`var(--${r.color||"blue"})`,padding:"2px 8px",borderRadius:99}}>{r.label}</div>
              </div>
              {e.amount && <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>Miktar: {e.amount}</div>}
              {e.note && <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{e.note}</div>}
              <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:4}}>{e.date} · {e.time}</div>
            </div>
            <div onClick={()=>remove(e.ts)} className="abp-tap" style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><X size={12} color="var(--ink-faint)"/></div>
          </Card>
        );
      })}
    </div>
  );
}



/* ============================================================
   BESLENME GÜNLÜĞÜ — annelerin çocuklarına verdikleri yemekleri
   kaydedebildiği ve yaşa göre öneri aldığı kalıcı günlük.
   ============================================================ */
function FoodLogSection({childId}) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [food, setFood] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState("6-8 Ay");
  const key = `foodlog:${childId||"default"}`;

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const saved = await storageGet(key, false);
      setEntries(saved || []);
    } catch { setError("Yemek günlüğü yüklenemedi."); }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const addEntry = async (text) => {
    const value = (text || food).trim();
    if (!value || saving) return;
    setSaving(true);
    const entry = {food:value, note:note.trim(), date:new Date().toLocaleDateString("tr-TR"), time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...entries];
    const ok = await storageSet(key, list, false);
    if (ok) { setEntries(list); setFood(""); setNote(""); showToast("Öğün kaydedildi ✓"); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = entries.filter(e=>e.ts!==ts);
    setEntries(list);
    await storageSet(key, list, false);
    showToast("Kayıt silindi");
  };

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Utensils} color="green" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>Bugün Ne Yedi?</div>
        </div>
        <input placeholder="Örn. Somon balığı ve patates püresi" value={food} onChange={e=>setFood(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder="Not ekle (opsiyonel, ör. az yedi / bayıldı)" value={note} onChange={e=>setNote(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <PrimaryButton onClick={()=>addEntry()} disabled={!food.trim()||saving} style={{padding:12,fontSize:14}}>{saving?"Kaydediliyor...":"Yemek Listesine Ekle"}</PrimaryButton>
      </Card>

      <SectionTitle>Geçmiş Öğünler</SectionTitle>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : entries.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok. İlk öğününü ekle!</Card>
      ) : entries.slice(0,10).map((e)=>(
        <Card key={e.ts} style={{marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13.5}}>{e.food}</div>
            {e.note && <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{e.note}</div>}
            <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:4}}>{e.date} · {e.time}</div>
          </div>
          <div onClick={()=>remove(e.ts)} className="abp-tap" style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><X size={12} color="var(--ink-faint)"/></div>
        </Card>
      ))}

      <SectionTitle>Yaşa Göre Beslenme Önerileri</SectionTitle>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:10}} className="abp-scrollbar">
        {["6-8 Ay","9-11 Ay","12+ Ay"].map(a=> <Pill_ key={a} active={ageFilter===a} onClick={()=>setAgeFilter(a)}>{a}</Pill_>)}
      </div>
      {FOOD_COMBO_SUGGESTIONS.filter(f=>f.age===ageFilter).map((f,i)=>(
        <Card key={i} style={{marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
          <IconBadge icon={Sparkles} color="purple" size={34}/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13.5}}>{f.combo}</div>
            <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{f.detail}</div>
          </div>
          <div onClick={()=>addEntry(f.combo)} className="abp-tap" style={{width:30,height:30,borderRadius:15,background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Plus size={15}/></div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   DİŞ ÇIKARMA TAKİBİ — huzursuzluk günlüğü + rahatlatıcı yöntemler
   ============================================================ */
function TeethingSection({childId}) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const key = `teething:${childId||"default"}`;

  const load = async () => {
    setLoading(true);
    const saved = await storageGet(key, false);
    setLogs(saved || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const logToday = async (restless) => {
    if (saving) return;
    setSaving(true);
    const entry = {restless, date:new Date().toLocaleDateString("tr-TR"), time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...logs];
    const ok = await storageSet(key, list, false);
    if (ok) { setLogs(list); showToast(restless ? "Huzursuzluk kaydedildi, öneriler güncellendi ✓" : "Bugün sakin olarak kaydedildi ✓"); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };

  const latest = logs[0];
  const isRestless = latest ? latest.restless : null;
  const orderedNames = isRestless === false ? TEETHING_CALM_TIP_ORDER : TEETHING_RESTLESS_TIP_ORDER;
  const orderedItems = orderedNames
    .map(n=>TEETHING_RELIEF_ITEMS.find(t=>t.name===n))
    .filter(Boolean)
    .concat(TEETHING_RELIEF_ITEMS.filter(t=>!orderedNames.includes(t.name)));

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <IconBadge icon={Smile} color="pink" size={36}/>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Bugün Huzursuz mu?</div>
            <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>Cevabına göre önerileri sıralayalım</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div onClick={()=>logToday(true)} className="abp-tap" style={{flex:1,textAlign:"center",padding:"14px 0",borderRadius:14,background: isRestless===true?"var(--ink)":"var(--pink)",color: isRestless===true?"#fff":"var(--ink)",fontWeight:700,fontSize:13.5}}>Evet, Huzursuz</div>
          <div onClick={()=>logToday(false)} className="abp-tap" style={{flex:1,textAlign:"center",padding:"14px 0",borderRadius:14,background: isRestless===false?"var(--ink)":"var(--green)",color: isRestless===false?"#fff":"var(--ink)",fontWeight:700,fontSize:13.5}}>Hayır, Sakin</div>
        </div>
        {latest && (
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:10,textAlign:"center"}}>Son kayıt: {latest.date} · {latest.time} — {latest.restless?"Huzursuzdu":"Sakindi"}</div>
        )}
      </Card>

      {latest && (
        <InfoBlock
          icon={isRestless?AlertCircle:Check}
          color={isRestless?"pink":"green"}
          title={isRestless?"Bugün İçin Öncelikli Öneriler":"Bebeğiniz Sakin — Genel Bilgi"}
          text={isRestless
            ? "Bebeğiniz huzursuzsa önce soğuk ve doğal yöntemleri deneyin; ihtiyaç halinde eczacınıza danışarak jel desteğini değerlendirebilirsiniz."
            : "Şu an belirgin bir huzursuzluk yok; yine de diş etlerini günlük kontrol etmek ve doğal yöntemleri hazır bulundurmak faydalı olur."}
          highlight
        />
      )}

      <SectionTitle>Rahatlatıcı Yöntemler</SectionTitle>
      {orderedItems.map((item,i)=>(
        <Card key={i} style={{marginBottom:10, border: item.warn ? "1.5px solid var(--pink-deep)" : undefined}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <IconBadge icon={item.icon} color={item.color} size={38}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{fontWeight:700,fontSize:14}}>{item.name}</div>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"2px 8px",borderRadius:99}}>{item.type}</div>
              </div>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.6,marginTop:6}}>{item.why}</div>
              <div style={{fontSize:11.5,color: item.warn?"#D98BA6":"var(--ink-faint)",lineHeight:1.5,marginTop:6,fontWeight:600}}>{item.note}</div>
            </div>
          </div>
        </Card>
      ))}
      <div style={{fontSize:11.5,color:"var(--ink-faint)",margin:"10px 4px 0"}}>Ateş, aşırı ağlama, iştahsızlık veya ishal gibi belirtiler eşlik ediyorsa bunu diş çıkarmaya bağlamadan önce doktorunuza danışın.</div>
    </div>
  );
}

/* ============================================================
   KAKA TAKİBİ — kıvam takibi ve kabızlık önerileri
   ============================================================ */
function stoolReason(typeKey, days) {
  switch (typeKey) {
    case "sert":
      return days >= 2
        ? {text:`${days} gündür sert/topak kaka görülüyor — bu kabızlık belirtisi olabilir. Bol sıvı, lifli meyve püreleri (erik, armut) ve karın masajı deneyebilirsiniz; 3 günü aşarsa doktorunuza danışın.`, severity:"warn"}
        : {text:"Tek seferlik sertlik genelde geçicidir; su/sıvı alımını artırıp izlemeye devam edin.", severity:"info"};
    case "sulu":
      return days >= 2
        ? {text:`${days} gündür sulu/cıvık kaka ishal belirtisi olabilir. Sıvı kaybına karşı bol sıvı verin; ${days>=3?"vakit kaybetmeden doktorunuza başvurun.":"devam ederse doktorunuza danışın."}`, severity: days>=3?"urgent":"warn"}
        : {text:"Tek seferlik sulu kaka genelde zararsızdır, tekrarlarsa izlemeye devam edin.", severity:"info"};
    case "yesil":
      return days >= 3
        ? {text:`${days} gündür yeşilimsi kaka görülüyor; genelde beslenmeyle ilgilidir ama uzun sürüyorsa doktorunuza danışabilirsiniz.`, severity:"info"}
        : {text:"Yeşilimsi renk çoğunlukla zararsızdır ve beslenmeyle ilişkilidir.", severity:"info"};
    case "mukuslu":
      return {text:`${days>1?`${days} gündür `:""}Mukuslu kaka sindirim sisteminde hafif tahriş belirtisi olabilir; ${days>=2?"devam ederse doktorunuza danışın.":"izlemeye devam edin."}`, severity: days>=2?"warn":"info"};
    case "kanli":
      return {text:"Kakada kan görülmesi ciddi olabilir; vakit kaybetmeden doktorunuza başvurun.", severity:"urgent"};
    default:
      return {text:"Kıvam normal aralıkta görünüyor, takibe devam edin.", severity:"ok"};
  }
}
const STOOL_SEVERITY_STYLE = {
  urgent:{icon:AlertCircle, color:"pink"},
  warn:{icon:AlertCircle, color:"pink"},
  info:{icon:Info, color:"blue"},
  ok:{icon:Check, color:"green"}
};

function PoopTrackerSection({childId}) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pendingType, setPendingType] = useState(null);
  const [pendingDays, setPendingDays] = useState(1);
  const key = `poop:${childId||"default"}`;

  const load = async () => {
    setLoading(true);
    const saved = await storageGet(key, false);
    setLogs(saved || []);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const confirmLog = async () => {
    if (saving || !pendingType) return;
    setSaving(true);
    const t = STOOL_TYPES.find(s=>s.key===pendingType);
    const entry = {type:pendingType, days:pendingDays, date:new Date().toLocaleDateString("tr-TR"), time:new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...logs];
    const ok = await storageSet(key, list, false);
    if (ok) { setLogs(list); showToast(`${t.label} · ${pendingDays} gündür kaydedildi ✓`, t.urgent?"error":"success"); setPendingType(null); setPendingDays(1); }
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };

  const latest = logs[0];
  const latestReason = latest ? stoolReason(latest.type, latest.days||1) : null;
  const showConstipationTips = latest && latest.type === "sert";

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Droplets} color="green" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>Kaka Kıvamını Kaydet</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {STOOL_TYPES.map(s=>(
            <div key={s.key} onClick={()=>{setPendingType(s.key); setPendingDays(1);}} className="abp-tap" style={{
              padding:"12px 8px",borderRadius:14,fontWeight:700,fontSize:12.5,textAlign:"center",
              background: pendingType===s.key ? "var(--ink)" : `var(--${s.color})`,
              color: pendingType===s.key ? "#fff" : "var(--ink)"
            }}>{s.label}</div>
          ))}
        </div>

        {pendingType && (
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(150,130,180,0.15)"}}>
            <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:8}}>Kaç gündür bu kıvamda? (Örn. 2 gündür yumuşak kaka yapıyor)</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[1,2,3,4,5].map(d=>(
                <div key={d} onClick={()=>setPendingDays(d)} className="abp-tap" style={{
                  flex:1,textAlign:"center",padding:"10px 0",borderRadius:12,fontWeight:700,fontSize:13,
                  background: pendingDays===d ? "var(--ink)" : "var(--bg)",
                  color: pendingDays===d ? "#fff" : "var(--ink-soft)"
                }}>{d===5?"5+":d}</div>
              ))}
            </div>
            <PrimaryButton onClick={confirmLog} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Kaydet"}</PrimaryButton>
          </div>
        )}
      </Card>

      {latestReason && (
        <InfoBlock
          icon={STOOL_SEVERITY_STYLE[latestReason.severity].icon}
          color={STOOL_SEVERITY_STYLE[latestReason.severity].color}
          title="Bu Kayda Göre Olası Nedenler"
          text={latestReason.text}
          highlight={latestReason.severity==="urgent"||latestReason.severity==="warn"}
        />
      )}

      {showConstipationTips && (
        <>
          <SectionTitle>Kabızlık İçin Genel Öneriler</SectionTitle>
          <Card>
            {CONSTIPATION_TIPS.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",fontSize:13, borderTop: i>0 ? "1px solid rgba(150,130,180,0.12)" : "none"}}>
                <Info size={14} color="var(--ink-faint)" style={{marginTop:2,flexShrink:0}}/> {t}
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionTitle>Geçmiş Kayıtlar</SectionTitle>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz kayıt yok. İlk kaydını ekle!</Card>
      ) : logs.slice(0,10).map((l)=>{
        const t = STOOL_TYPES.find(s=>s.key===l.type) || {};
        const r = stoolReason(l.type, l.days||1);
        return (
          <Card key={l.ts} style={{marginBottom:8,fontSize:13.5}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><strong>{t.label}</strong> <span style={{color:"var(--ink-faint)",fontSize:12}}>· {l.days||1} gündür · {l.date} {l.time}</span></div>
              {t.urgent && <span style={{fontSize:11,fontWeight:700,color:"#D98BA6"}}>Doktora danışın</span>}
            </div>
            <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:4}}>{r.text}</div>
          </Card>
        );
      })}
    </div>
  );
}

/* ============================================================
   ALIŞVERİŞ LİSTESİ — hazır yaş bazlı öneriler + kullanıcının kendi
   ekleyip işaretleyip silebildiği kalıcı liste (window.storage).
   ============================================================ */
function ShoppingListSection() {
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({}); // { itemName: true }
  const [customItems, setCustomItems] = useState([]); // [{id, text}]
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    (async ()=>{
      const [savedChecked, savedCustom] = await Promise.all([
        storageGet("shopping:checked", false),
        storageGet("shopping:custom", false)
      ]);
      setChecked(savedChecked || {});
      setCustomItems(savedCustom || []);
      setLoading(false);
    })();
  }, []);

  const toggleCheck = async (name) => {
    const next = {...checked, [name]: !checked[name]};
    setChecked(next);
    await storageSet("shopping:checked", next, false);
  };

  const addCustomItem = async () => {
    const text = input.trim();
    if (!text || saving) return;
    setSaving(true);
    const item = {id: Date.now(), text};
    const list = [...customItems, item];
    const ok = await storageSet("shopping:custom", list, false);
    if (ok) { setCustomItems(list); setInput(""); showToast("Liste eklendi ✓"); }
    else showToast("Eklenemedi, tekrar deneyin", "error");
    setSaving(false);
  };

  const removeCustomItem = async (id) => {
    const list = customItems.filter(i=>i.id!==id);
    setCustomItems(list);
    await storageSet("shopping:custom", list, false);
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;

  if (loading) {
    return <div style={{marginTop:16}}><SkeletonCard/><SkeletonCard/></div>;
  }

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>Kendi Listeni Oluştur</div>
        <div style={{display:"flex",gap:8}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && addCustomItem()}
            placeholder="Örn. Bebek maması"
            style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none"}}
          />
          <div onClick={addCustomItem} className="abp-tap" style={{width:44,height:44,borderRadius:14,background: input.trim()?"linear-gradient(135deg, #E8A9C4, #B79AEA)":"var(--ink-faint)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Plus size={18} color="#fff"/>
          </div>
        </div>
      </Card>

      {customItems.length > 0 && (
        <>
          <SectionTitle>Listem ({customItems.length})</SectionTitle>
          {customItems.map(it=>{
            const isChecked = !!checked["custom:"+it.id];
            return (
              <Card key={it.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
                <div onClick={()=>toggleCheck("custom:"+it.id)} className="abp-tap" style={{width:24,height:24,borderRadius:8,border:"2px solid "+(isChecked?"transparent":"var(--ink-faint)"),background: isChecked?"var(--ink)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isChecked && <Check size={14} color="#fff"/>}
                </div>
                <div style={{flex:1,fontSize:13.5,textDecoration: isChecked?"line-through":"none",color: isChecked?"var(--ink-faint)":"var(--ink)"}}>{it.text}</div>
                <div onClick={()=>removeCustomItem(it.id)} className="abp-tap" style={{width:26,height:26,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
              </Card>
            );
          })}
        </>
      )}

      <SectionTitle action={<div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{totalChecked} işaretli</div>}>Yaşa Göre Öneriler</SectionTitle>
      {Object.entries(SHOPPING_BY_AGE).map(([age,items])=>(
        <div key={age} style={{marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,margin:"8px 4px"}}>{age}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {items.map(it=>{
              const key = age+":"+it;
              const isChecked = !!checked[key];
              return (
                <Card key={it} onClick={()=>toggleCheck(key)} style={{fontSize:13,display:"flex",alignItems:"center",gap:8, opacity:isChecked?0.55:1}}>
                  <div style={{width:18,height:18,borderRadius:6,border:"2px solid "+(isChecked?"transparent":"var(--ink-faint)"),background: isChecked?"var(--ink)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {isChecked && <Check size={11} color="#fff"/>}
                  </div>
                  <span style={{textDecoration:isChecked?"line-through":"none"}}>{it}</span>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ACTIVITIES TAB
   ============================================================ */
function PlaceCard({place, color, icon:Icon, active, onSelect}) {
  return (
    <Card
      style={{
        marginBottom:10, display:"flex", alignItems:"center", gap:12,
        border: active ? "1.5px solid var(--ink)" : "1.5px solid transparent"
      }}
      onClick={()=>onSelect && onSelect(place)}
    >
      <IconBadge icon={Icon} color={color} size={40}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontWeight:700, fontSize:13.5, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{place.name}</div>
        <div style={{fontSize:11.5, color:"var(--ink-soft)", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
          {place.address || "Adres bilgisi yok"}
        </div>
      </div>
      <div
        style={{textAlign:"right", flexShrink:0}}
        onClick={(e)=>{ e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`, "_blank"); }}
      >
        <div style={{fontSize:12.5, fontWeight:800, color:"var(--ink)"}}>
          {place.distanceKm < 1 ? `${Math.round(place.distanceKm*1000)} m` : `${place.distanceKm.toFixed(1)} km`}
        </div>
        <div style={{fontSize:10, color:"var(--ink-faint)"}}>Yol tarifi →</div>
      </div>
    </Card>
  );
}

function NearbyTab() {
  const [geoStatus, setGeoStatus] = useState("idle"); // idle|loading|ready|denied|error|unsupported
  const [coords, setCoords] = useState(null);
  const [mapView, setMapView] = useState("country"); // country|local
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmLoading, setPharmLoading] = useState(false);
  const [pharmError, setPharmError] = useState(false);
  const [babyStores, setBabyStores] = useState([]);
  const [babyLoading, setBabyLoading] = useState(false);
  const [babyError, setBabyError] = useState(false);
  const [category, setCategory] = useState("pharmacy"); // "pharmacy" | "baby" — haritada/listede hangi kategori gösterilsin
  const [selectedPlace, setSelectedPlace] = useState(null); // tıklanan eczane/mağaza haritada işaretlenir

  const loadNearby = (lat, lon) => {
    setPharmLoading(true); setBabyLoading(true); setSelectedPlace(null);
    setPharmError(false); setBabyError(false);

    reverseGeocodeTR(lat, lon)
      .then(r => { setProvince(r.province); setDistrict(r.district); })
      .catch(()=>{});

    // Eczaneler — tek istek, 15km yarıçap
    overpassNearby(lat, lon, 15000, [["amenity","pharmacy"]])
      .then(results => {
        const withDist = results
          .map(p => ({...p, distanceKm: haversineKm(lat, lon, p.lat, p.lon)}))
          .sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,8);
        setPharmacies(withDist);
      })
      .catch(()=>{ setPharmacies([]); setPharmError(true); })
      .finally(()=>setPharmLoading(false));

    // Bebek mağazaları — tek istek, 20km yarıçap; bebek ürünleri + oyuncakçı birlikte sorgulanır
    overpassNearby(lat, lon, 20000, [["shop","baby_goods"],["shop","toys"]])
      .then(results => {
        const withDist = results
          .map(p => ({...p, distanceKm: haversineKm(lat, lon, p.lat, p.lon)}))
          .sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,8);
        setBabyStores(withDist);
      })
      .catch(()=>{ setBabyStores([]); setBabyError(true); })
      .finally(()=>setBabyLoading(false));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setGeoStatus("unsupported"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const {latitude, longitude} = pos.coords;
        setCoords({lat:latitude, lon:longitude});
        setGeoStatus("ready");
        storageSet("nearby:lastCoords", {lat:latitude, lon:longitude, ts:Date.now()}, false);
        loadNearby(latitude, longitude);
      },
      (err) => {
        setGeoStatus(err.code===1 ? "denied" : "error");
        showToast(err.code===1 ? "Konum izni reddedildi" : "Konum alınamadı, tekrar deneyin", "error");
      },
      {enableHighAccuracy:true, timeout:12000, maximumAge:300000}
    );
  };

  useEffect(()=>{
    (async ()=>{
      const cached = await storageGet("nearby:lastCoords", false);
      if (cached && cached.lat) {
        setCoords({lat:cached.lat, lon:cached.lon});
        setGeoStatus("ready");
        loadNearby(cached.lat, cached.lon);
      }
    })();
  }, []);

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 4px"}}>Yakınımda</h2>
      <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:14}}>Konumuna göre en yakın eczaneler ve bebek mağazaları.</div>

      {geoStatus!=="ready" && (
        <Card style={{marginBottom:14, textAlign:"center", padding:"26px 18px"}}>
          <div style={{width:56,height:56,borderRadius:20,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <MapPin size={26} color="var(--ink)"/>
          </div>
          <div style={{fontWeight:700, fontSize:14.5, marginBottom:6}}>
            {geoStatus==="denied" ? "Konum izni verilmedi" :
             geoStatus==="unsupported" ? "Cihazın konumu desteklemiyor" :
             geoStatus==="error" ? "Konum alınamadı" :
             "Konumunu bul, en yakınları görelim"}
          </div>
          <div style={{fontSize:12, color:"var(--ink-soft)", marginBottom:14, lineHeight:1.5}}>
            {geoStatus==="denied"
              ? "Tarayıcı/telefon ayarlarından bu site için konum iznini açıp tekrar dene."
              : "Konumunu paylaşman en yakın eczane ve bebek mağazalarını harita üzerinde göstermemizi sağlar."}
          </div>
          <PrimaryButton onClick={requestLocation} style={{maxWidth:220,margin:"0 auto"}}>
            {geoStatus==="loading" ? "Konum alınıyor..." : "Konumumu Bul"}
          </PrimaryButton>
        </Card>
      )}

      {coords && (
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <Pill_ active={category==="pharmacy"} onClick={()=>{ setCategory("pharmacy"); setSelectedPlace(null); }}>
            Eczaneler
          </Pill_>
          <Pill_ active={category==="baby"} onClick={()=>{ setCategory("baby"); setSelectedPlace(null); }}>
            Bebek Mağazaları
          </Pill_>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <Pill_ active={mapView==="country"} onClick={()=>{ setMapView("country"); setSelectedPlace(null); }}>Türkiye</Pill_>
        {coords && <Pill_ active={mapView==="local"} onClick={()=>setMapView("local")}>Yakın Çevre</Pill_>}
      </div>
      <div style={{borderRadius:"var(--radius-lg)", overflow:"hidden", boxShadow:"var(--shadow-sm)", height:200}}>
        <NearbyMap
          coords={coords}
          places={category==="pharmacy" ? pharmacies : babyStores}
          category={category}
          selectedPlace={selectedPlace}
          onSelectPlace={(pl)=>{ setSelectedPlace(pl); setMapView("local"); }}
          mapView={mapView}
        />
      </div>
      {coords && (
        <div style={{fontSize:11, color:"var(--ink-faint)", marginTop:6, display:"flex", alignItems:"center", gap:4}}>
          <MapPin size={11}/>
          {selectedPlace
            ? selectedPlace.name
            : `${district ? district+", " : ""}${province || "Konumun bulundu"}`}
        </div>
      )}

      {coords && category==="pharmacy" && (
        <>
          <Card
            style={{marginTop:18, background:"linear-gradient(135deg, #E8A9C4, #B79AEA)"}}
            onClick={()=>window.open(`https://www.eczaneler.gen.tr/nobetci-${trSlug(province)}${district?("-"+trSlug(district)):""}`, "_blank")}
          >
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:16,background:"rgba(255,255,255,0.28)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Pill size={20} color="#fff"/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:14.5,color:"#fff"}}>Bugün Nöbetçi Eczaneler</div>
                <div style={{fontSize:11.5,color:"rgba(255,255,255,0.9)",marginTop:2}}>
                  {province ? `${province}${district?" · "+district:""} için güncel listeyi gör` : "İlin için güncel listeyi gör"}
                </div>
              </div>
              <ArrowRight size={18} color="#fff"/>
            </div>
          </Card>

          <SectionTitle>En Yakın Eczaneler</SectionTitle>
          {pharmLoading && (
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--ink-soft)",fontSize:12.5,marginBottom:8}}>
              <div className="abp-spin-slow" style={{width:14,height:14,borderRadius:"50%",border:"2px solid var(--ink-faint)",borderTopColor:"var(--ink)"}}/>
              Yakındaki eczaneler aranıyor...
            </div>
          )}
          {!pharmLoading && pharmError && (
            <Card style={{textAlign:"center"}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:10}}>Eczaneler yüklenirken bağlantı sorunu oluştu.</div>
              <PrimaryButton style={{maxWidth:180,margin:"0 auto",padding:10,fontSize:12.5}} onClick={()=>loadNearby(coords.lat, coords.lon)}>Tekrar Dene</PrimaryButton>
            </Card>
          )}
          {!pharmLoading && !pharmError && pharmacies.length===0 && (
            <Card style={{textAlign:"center", color:"var(--ink-soft)", fontSize:12.5}}>Yakında kayıtlı eczane bulunamadı.</Card>
          )}
          {pharmacies.map(p => (
            <PlaceCard
              key={p.id} place={p} color="purple" icon={Pill}
              active={selectedPlace?.id===p.id}
              onSelect={(pl)=>{ setSelectedPlace(pl); setMapView("local"); }}
            />
          ))}
        </>
      )}

      {coords && category==="baby" && (
        <>
          <SectionTitle>En Yakın Bebek Mağazaları</SectionTitle>
          {babyLoading && (
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--ink-soft)",fontSize:12.5,marginBottom:8}}>
              <div className="abp-spin-slow" style={{width:14,height:14,borderRadius:"50%",border:"2px solid var(--ink-faint)",borderTopColor:"var(--ink)"}}/>
              Yakındaki bebek mağazaları aranıyor...
            </div>
          )}
          {!babyLoading && babyError && (
            <Card style={{textAlign:"center"}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:10}}>Bebek mağazaları yüklenirken bağlantı sorunu oluştu.</div>
              <PrimaryButton style={{maxWidth:180,margin:"0 auto",padding:10,fontSize:12.5}} onClick={()=>loadNearby(coords.lat, coords.lon)}>Tekrar Dene</PrimaryButton>
            </Card>
          )}
          {!babyLoading && !babyError && babyStores.length===0 && (
            <Card
              style={{textAlign:"center"}}
              onClick={()=>window.open(`https://www.google.com/maps/search/bebek+mağazası/@${coords.lat},${coords.lon},14z`, "_blank")}
            >
              <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>Yakında kayıtlı bebek mağazası bulunamadı.</div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",marginTop:6}}>Google Haritalar'da ara →</div>
            </Card>
          )}
          {babyStores.map(p => (
            <PlaceCard
              key={p.id} place={p} color="blue" icon={ShoppingBag}
              active={selectedPlace?.id===p.id}
              onSelect={(pl)=>{ setSelectedPlace(pl); setMapView("local"); }}
            />
          ))}
        </>
      )}
    </div>
  );
}

function ActivitiesTab() {
  const [section, setSection] = useState("gunluk");
  const [playing, setPlaying] = useState(null);
  const [speakingStory, setSpeakingStory] = useState(null);
  const [speakingLullaby, setSpeakingLullaby] = useState(null);
  const [timer, setTimer] = useState(null);
  const [favs, setFavs] = useState([]);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [cmsActivities, setCmsActivities] = useState([]);
  const [cmsSounds, setCmsSounds] = useState([]);
  const [cmsLullabies, setCmsLullabies] = useState([]);
  const [ageFilter, setAgeFilter] = useState("Tümü");
  const [selectedCraft, setSelectedCraft] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(()=> ()=>{ stopSpeaking(); stopSleepSound(); }, []); // sekmeden çıkarken sesi kapat

  const toggleStory = (s) => {
    if (speakingStory === s.title) { stopSpeaking(); stopSleepSound(); setSpeakingStory(null); return; }
    stopSpeaking(); stopSleepSound();
    if (s.url) {
      const ok = playSleepSound({name:s.title, url:s.url}, {});
      if (ok) setSpeakingStory(s.title);
      return;
    }
    const ok = speakText(s.text, {rate:0.95, onEnd:()=>setSpeakingStory(null)});
    if (ok) setSpeakingStory(s.title);
  };
  const toggleLullaby = (l) => {
    if (speakingLullaby === l.title) { stopSpeaking(); stopSleepSound(); setSpeakingLullaby(null); return; }
    stopSpeaking(); stopSleepSound();
    if (l.url) {
      const ok = playSleepSound({name:l.title, url:l.url}, {});
      if (ok) setSpeakingLullaby(l.title);
      return;
    }
    const ok = speakText(l.lyrics || l.title, {rate:0.82, pitch:1.05, onEnd:()=>setSpeakingLullaby(null)});
    if (ok) setSpeakingLullaby(l.title);
  };

  useEffect(()=>{
    let alive = true;
    (async ()=>{
      const [acts, sounds, lulls] = await Promise.all([
        storageGet("cms:activities", true),
        storageGet("cms:sounds", true),
        storageGet("cms:lullabies", true)
      ]);
      if (!alive) return;
      setCmsActivities(acts || []);
      setCmsSounds((sounds||[]).map(s=>({name:s.name, icon:Music2})));
      setCmsLullabies(lulls || []);
      setCmsLoading(false);
    })();
    return ()=>{ alive = false; };
  }, []);

  const allActivities = [...ACTIVITIES_POOL, ...cmsActivities];
  const allSounds = [...SLEEP_SOUNDS, ...cmsSounds];
  const allLullabies = [...LULLABIES_POOL, ...cmsLullabies];

  const sections = [
    {key:"gunluk", label:"Günlük Aktivite"},
    {key:"elisi", label:"El İşi"},
    {key:"hikaye", label:"Hikayeler"},
    {key:"ninni", label:"Ninniler"},
    {key:"uykusesi", label:"Uyku Sesleri"},
    {key:"annediyeti", label:"Anne Diyeti"},
    {key:"annesagligi", label:"Anne Sağlığı"},
    {key:"alisveris", label:"Alışveriş Listesi"},
    {key:"ani", label:"Anı Günlüğü"},
    {key:"rozet", label:"Rozetler"}
  ];

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>Etkinlikler</h2>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {sections.map(s => <Pill_ key={s.key} active={section===s.key} onClick={()=>setSection(s.key)}>{s.label}</Pill_>)}
      </div>

      {section === "gunluk" && (
        <div style={{marginTop:16}}>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10}} className="abp-scrollbar">
            {["Tümü","0-6 ay","6-12 ay","12-24 ay","2-3 yaş","3+ yaş"].map(a=>(
              <Pill_ key={a} active={ageFilter===a} onClick={()=>setAgeFilter(a)}>{a}</Pill_>
            ))}
          </div>
          {cmsLoading && <SkeletonCard/>}
          {allActivities.filter(a=>ageFilter==="Tümü"||!a.age||a.age===ageFilter).map((a,i)=>(
            <Card key={i} className="abp-fade-up" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontWeight:700,fontSize:14.5}}>{a.title}</div>
                {a.age && <span style={{fontSize:10.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"3px 8px",borderRadius:99}}>{a.age}</span>}
              </div>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginTop:4}}>Geliştirdiği beceri: {a.skill}</div>
              <div style={{display:"flex",gap:14,marginTop:8,fontSize:12}}>
                <span>⏱ {a.duration||"—"}</span><span>🧸 {a.materials||"—"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {section === "elisi" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
          {CRAFTS_POOL.map((c,i)=>(
            <Card key={i} onClick={()=>setSelectedCraft(c)}>
              <IconBadge icon={Sparkles} color={["pink","blue","purple","green"][i%4]} size={36}/>
              <div style={{fontWeight:700,fontSize:13.5,marginTop:8}}>{c.title}</div>
              <div style={{fontSize:11.5,color:"var(--ink-soft)",marginTop:3}}>{c.cat} · {c.age} yaş</div>
              <div style={{fontSize:11,color:"var(--ink-faint)",marginTop:6,display:"flex",alignItems:"center",gap:4}}><Info size={11}/> Nasıl yapılır?</div>
            </Card>
          ))}
        </div>
      )}

      {selectedCraft && (
        <Modal title={selectedCraft.title} onClose={()=>setSelectedCraft(null)}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink-faint)",marginBottom:10}}>{selectedCraft.cat} · {selectedCraft.age} yaş</div>
          <InfoBlock icon={ShoppingBag} color="blue" title="Gerekli Malzemeler" text={selectedCraft.materials}/>
          <SectionTitle>Adım Adım Yapılışı</SectionTitle>
          <Card>
            {selectedCraft.steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom: i<selectedCraft.steps.length-1?"1px solid rgba(150,130,180,0.12)":"none"}}>
                <div style={{width:22,height:22,borderRadius:11,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </Card>
          {selectedCraft.tip && <InfoBlock icon={Sparkles} color="purple" title="Gelişim İpucu" text={selectedCraft.tip}/>}
        </Modal>
      )}

      {section === "hikaye" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>Tarayıcının sesli okuma özelliğiyle gerçekten dinlenebilir.</div>
          {STORIES_POOL.map((s,i)=>{
            const isSpeaking = speakingStory === s.title;
            return (
              <Card key={i} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <div onClick={()=>toggleStory(s)} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: isSpeaking?"var(--purple)":"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isSpeaking ? <Pause size={16}/> : <Play size={16}/>}
                </div>
                <div style={{flex:1}} onClick={()=>setFavs(f=>f.includes(s.title)?f.filter(x=>x!==s.title):[...f,s.title])}>
                  <div style={{fontWeight:700,fontSize:14}}>{s.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)"}}>{s.cat} · {s.dur}{isSpeaking?" · Okunuyor...":""}</div>
                </div>
                <Star size={18} fill={favs.includes(s.title)?"#F0A8C6":"none"} color="#F0A8C6" onClick={()=>setFavs(f=>f.includes(s.title)?f.filter(x=>x!==s.title):[...f,s.title])}/>
              </Card>
            );
          })}
        </div>
      )}

      {section === "ninni" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>Sözlerini yumuşak bir sesle dinleyebilirsiniz.</div>
          {allLullabies.map((l,i)=>{
            const isSpeaking = speakingLullaby === l.title;
            return (
              <Card key={i} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}} onClick={()=>toggleLullaby(l)}>
                <div style={{width:38,height:38,borderRadius:19,background: isSpeaking?"var(--blue-deep)":"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isSpeaking ? <Pause size={16}/> : <Play size={16}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{l.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)"}}>{l.cat}{isSpeaking?" · Dinleniyor...":""}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {section === "uykusesi" && (
        <div style={{marginTop:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {allSounds.map((s,i)=>{
              const Icon = s.icon;
              const active = playing === s.name;
              return (
                <Card key={i} onClick={()=>{
                  if (active) { stopSleepSound(); setPlaying(null); return; }
                  const ok = playSleepSound(s, {onAutoStop:()=>setPlaying(null)});
                  if (ok) { setPlaying(s.name); scheduleSleepSoundAutoStop(timer, ()=>setPlaying(null)); }
                }} style={{textAlign:"center", background: active? "var(--purple)":"var(--card)"}}>
                  <Icon size={22} style={{margin:"0 auto 6px"}}/>
                  <div style={{fontSize:11.5,fontWeight:700}}>{s.name}</div>
                </Card>
              );
            })}
          </div>
          {playing && (
            <Card style={{marginTop:14,textAlign:"center"}}>
              <div style={{fontWeight:700,marginBottom:10}}>{playing} çalıyor</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                {["15 dk","30 dk","1 saat","Sonsuz"].map(t=>(
                  <Pill_ key={t} active={timer===t} onClick={()=>{ setTimer(t); scheduleSleepSoundAutoStop(t, ()=>setPlaying(null)); }}>{t}</Pill_>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {section === "annediyeti" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:12,lineHeight:1.6}}>Aşağıdaki plan genel bir örnektir; emzirme, hamilelik veya özel sağlık durumunuza göre doktorunuz/diyetisyeninizle birlikte kişiselleştirilmesi önerilir.</div>
          <Card>
            <div style={{fontWeight:800,fontSize:15}}>Bugünkü Örnek Beslenme Planı</div>
            <div style={{marginTop:12}}>
              {[
                {meal:"🌅 Kahvaltı (07:00-09:00)", detail:"1 kase yulaf ezmesi + süt, 1 haşlanmış yumurta, bir avuç ceviz/badem, 2 dilim tam tahıllı ekmek, peynir ve domates.", why:"Yulaf ve tam tahıl uzun süreli enerji sağlar; yumurta ve kuruyemiş protein ile sağlıklı yağ ihtiyacını karşılar."},
                {meal:"🍎 Ara Öğün (10:30)", detail:"1 orta boy meyve (elma, muz veya armut) + 1 avuç kuru üzüm ya da 1 bardak ayran.", why:"Kan şekerini dengede tutar, öğünler arası açlığı önler."},
                {meal:"🍽 Öğle Yemeği (12:30-13:30)", detail:"Izgara tavuk veya balık, bulgur pilavı, bol yeşillikli salata (zeytinyağlı), 1 kase yoğurt.", why:"Doymuş yağı düşük protein kaynağı ve lifli karbonhidrat kombinasyonu, hem doyurucu hem sindirim dostu."},
                {meal:"🥕 Ara Öğün (16:00)", detail:"Havuç/salatalık çubukları + humus, ya da bir avuç kuruyemiş.", why:"Lif ve sağlıklı yağ ile enerjiyi akşama kadar korur."},
                {meal:"🌙 Akşam Yemeği (19:00-20:00)", detail:"Fırında somon veya baklagil yemeği, buharda sebze, az yağlı yoğurt sosu.", why:"Omega-3 ve bitkisel protein, gece toparlanmasını ve emzirme kalitesini destekler."},
                {meal:"💧 Gün Boyu", detail:"En az 2-2.5 litre su, emziriyorsanız susadıkça ekstra sıvı için.", why:"Yeterli sıvı alımı hem süt üretimi hem genel enerji için kritik önemdedir."}
              ].map((m,i)=>(
                <div key={i} style={{padding:"10px 0",borderBottom: i<5?"1px solid rgba(150,130,180,0.12)":"none"}}>
                  <div style={{fontWeight:700,fontSize:13.5}}>{m.meal}</div>
                  <div style={{fontSize:12.5,color:"var(--ink-soft)",marginTop:4,lineHeight:1.55}}>{m.detail}</div>
                  <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:4,lineHeight:1.5,fontStyle:"italic"}}>{m.why}</div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{display:"flex",gap:10,marginTop:12}}>
            <Card style={{flex:1,textAlign:"center"}}><div style={{fontWeight:800}}>2100</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>kcal hedef</div></Card>
            <Card style={{flex:1,textAlign:"center"}}><div style={{fontWeight:800}}>75g</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>protein</div></Card>
            <Card style={{flex:1,textAlign:"center"}}><div style={{fontWeight:800}}>2.5L</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>su</div></Card>
          </div>

          <SectionTitle>Bu Dönemde Öncelik Verilmesi Gerekenler</SectionTitle>
          <Card>
            {[
              "Demir: kırmızı et, yeşil yapraklı sebze, mercimek — doğum sonrası kayıpları telafi eder.",
              "Kalsiyum: süt ürünleri, susam, badem — kemik sağlığı ve emzirme için gereklidir.",
              "Omega-3: somon, ceviz, keten tohumu — bebeğin beyin gelişimini ve annenin ruh halini destekler.",
              "Lif: tam tahıllar, sebze, meyve — doğum sonrası sindirim sorunlarını azaltır.",
              "Bol sıvı: su, ayran, bitki çayları (doktor onaylı) — süt üretimi ve genel toparlanma için önemlidir."
            ].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 0",fontSize:13}}><Check size={14} color="#7DBE96"/> {t}</div>
            ))}
          </Card>

          <SectionTitle>Dikkat Edilmesi Gerekenler</SectionTitle>
          <Card>
            {[
              "Aşırı kafein (günde 2 fincandan fazla kahve) bebeğin uykusunu etkileyebilir.",
              "Alkol emzirme döneminde önerilmez.",
              "Cıva oranı yüksek balıklardan (köpekbalığı, kılıç balığı) kaçının.",
              "Az pişmiş et/yumurta ve pastörize edilmemiş süt ürünleri risk taşır.",
              "Aşırı işlenmiş/şekerli gıdalar yerine doğal, taze besinleri tercih edin."
            ].map((t,i)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 0",fontSize:13}}><X size={14} color="#D98BA6"/> {t}</div>
            ))}
          </Card>
        </div>
      )}

      {section === "annesagligi" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>Detaylı bilgi için bir başlığa dokunun.</div>
          {MOM_HEALTH_ARTICLES.map((a,i)=>(
            <Card key={i} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}} onClick={()=>setSelectedArticle(a)}>
              <IconBadge icon={a.icon||Heart} color={["pink","blue","purple","green"][i%4]} size={38}/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:700,color:"var(--ink-faint)"}}>{a.cat.toUpperCase()}</div>
                <div style={{fontWeight:700,fontSize:14,marginTop:2}}>{a.title}</div>
              </div>
              <ChevronRight size={16} color="var(--ink-faint)"/>
            </Card>
          ))}
        </div>
      )}

      {selectedArticle && (
        <Modal title={selectedArticle.title} onClose={()=>setSelectedArticle(null)}>
          <div style={{fontSize:11.5,fontWeight:700,color:"var(--ink-faint)",marginBottom:12}}>{selectedArticle.cat.toUpperCase()}</div>
          <div style={{fontSize:13.5,lineHeight:1.75,color:"var(--ink)"}}>{selectedArticle.body}</div>
          <div style={{fontSize:11,color:"var(--ink-faint)",marginTop:14,fontStyle:"italic"}}>Bu bilgiler genel bilgilendirme amaçlıdır, tanı veya tedavi yerine geçmez. Endişeleriniz varsa doktorunuza danışın.</div>
        </Modal>
      )}

      {section === "alisveris" && <ShoppingListSection/>}

      {section === "ani" && <MemoryJournal/>}

      {section === "rozet" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
          {BADGES.map((b,i)=>{
            const Icon = b.icon; const earned = i < 3;
            return (
              <Card key={i} style={{textAlign:"center", opacity: earned?1:0.55}}>
                <div style={{width:52,height:52,borderRadius:26,background: earned?"var(--pink)":"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}>
                  {earned ? <Icon size={22}/> : <Lock size={18}/>}
                </div>
                <div style={{fontWeight:700,fontSize:12.5}}>{b.title}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MEMORY_TYPES = ["İlk Gülümseme","İlk Diş","İlk Adım","İlk Kelime","İlk Emekleme","İlk Banyo","İlk Saç Kesimi","İlk Okul Günü","Diğer"];
function MemoryJournal() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState(MEMORY_TYPES[0]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    const saved = await storageGet("memories:entries", false);
    if (saved) setEntries(saved);
    else if (saved === null) setEntries([]);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const save = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    const entry = {title:text.trim(), type, photoUrl:photoUrl.trim()||null, date:new Date().toLocaleDateString("tr-TR"), ts:Date.now()};
    const list = [entry, ...entries];
    const ok = await storageSet("memories:entries", list, false);
    if (ok) {
      setEntries(list); setText(""); setPhotoUrl(""); setType(MEMORY_TYPES[0]);
      showToast("Anı kaydedildi ✓");
    } else {
      showToast("Kaydedilemedi, tekrar deneyin", "error");
    }
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = entries.filter(e=>e.ts!==ts);
    setEntries(list);
    await storageSet("memories:entries", list, false);
    showToast("Anı silindi");
  };

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:2}} className="abp-scrollbar">
          {MEMORY_TYPES.map(t=><Pill_ key={t} active={type===t} onClick={()=>setType(t)}>{t}</Pill_>)}
        </div>
        <input placeholder="Bugün ne oldu, kısaca anlat..." value={text} onChange={e=>setText(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder="Fotoğraf bağlantısı (opsiyonel URL)" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <PrimaryButton onClick={save} disabled={!text.trim()||saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Kaydet"}</PrimaryButton>
      </Card>
      <SectionTitle>Anı Zaman Çizelgesi</SectionTitle>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <><SkeletonCard/><SkeletonCard/></>
      ) : entries.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>Henüz bir anı eklenmedi. İlkini ekle!</Card>
      ) : entries.map((e,i)=>(
        <Card key={e.ts||i} className="abp-fade-up" style={{marginBottom:10,display:"flex",gap:12,alignItems:"center"}}>
          {e.photoUrl ? (
            <img src={e.photoUrl} alt={e.title} style={{width:44,height:44,borderRadius:14,objectFit:"cover",flexShrink:0}} onError={ev=>{ev.target.style.display="none";}}/>
          ) : (
            <IconBadge icon={Star} color="pink" size={44}/>
          )}
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:14}}>{e.title}</div>
            <div style={{fontSize:12,color:"var(--ink-soft)"}}>{e.type} · {e.date}</div>
          </div>
          <div onClick={()=>remove(e.ts)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   AI ASSISTANT TAB — Claude API + kalıcı sohbet geçmişi
   ============================================================ */
const ASSISTANT_SYSTEM_PROMPT = "Sen bir Anne & Bebek uygulamasındaki yardımcı asistansın. Türkçe konuşuyorsun. Hamilelik, bebek bakımı, uyku, beslenme ve çocuk gelişimi hakkında sıcak, kısa ve anlaşılır bilgi veriyorsun. KESİNLİKLE tanı koymuyorsun, ilaç veya doz önermiyorsun. Ateş, kanama, şiddetli ağrı, nefes darlığı gibi riskli/acil belirtilerde mutlaka ve açıkça bir sağlık profesyoneline veya acil servise başvurmasını söylüyorsun. Yanıtların 3-5 cümleyi geçmesin.";
const ASSISTANT_SUGGESTIONS = ["Bebeğim 8 aylık, muz verebilir miyim?","Gece sürekli ağlıyor, ne yapabilirim?","Bu hafta nelere dikkat etmeliyim?"];

function newConversation() {
  return {
    id: Math.random().toString(36).slice(2),
    title: "Yeni Sohbet",
    messages: [{role:"bot", text:"Merhaba! Ben Anne Asistanınız 🤍 Hamilelik, bebek bakımı veya gelişimle ilgili merak ettiklerinizi sorabilirsiniz. Acil durumlarda lütfen doktorunuza başvurun."}],
    updatedAt: Date.now()
  };
}

/* ============================================================
   ANNE SOHBETİ — bu artifact'ı kullanan tüm anneler arasında
   paylaşımlı bir sohbet alanı (window.storage, shared=true).
   Not: Gerçek zamanlı değil, birkaç saniyede bir yenilenir (polling).
   Gönderdiğiniz mesajlar bu artifact'ı açan HERKES tarafından görülebilir.
   ============================================================ */
function CommunityChat() {
  const [nickname, setNickname] = useState(null);
  const [nickInput, setNickInput] = useState("");
  const [loadingNick, setLoadingNick] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{
    (async ()=>{
      const saved = await storageGet("profile:nickname", false);
      if (saved && saved.name) setNickname(saved.name);
      setLoadingNick(false);
    })();
  }, []);

  const loadMessages = async () => {
    const saved = await storageGet("community:messages", true);
    setMessages((saved || []).slice(-200));
    setLoading(false);
  };
  useEffect(()=>{
    if (!nickname) return;
    loadMessages();
    const id = setInterval(loadMessages, 4000);
    return ()=>clearInterval(id);
  }, [nickname]);

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const saveNickname = async () => {
    if (!nickInput.trim()) return;
    const val = {name: nickInput.trim().slice(0,24)};
    await storageSet("profile:nickname", val, false);
    setNickname(val.name);
    showToast("Takma adınız kaydedildi ✓");
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const msg = {id: Math.random().toString(36).slice(2), name: nickname, text: input.trim().slice(0,500), ts: Date.now()};
    const latest = await storageGet("community:messages", true) || [];
    const list = [...latest, msg].slice(-200);
    const ok = await storageSet("community:messages", list, true);
    if (ok) { setMessages(list); setInput(""); }
    else showToast("Mesaj gönderilemedi, tekrar deneyin", "error");
    setSending(false);
  };

  if (loadingNick) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>Anne Sohbeti</h2>
        <SkeletonCard lines={1}/>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px 20px 110px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 6px"}}>Anne Sohbeti</h2>
        <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:16,lineHeight:1.6}}>Diğer annelerle sohbet edebileceğiniz paylaşımlı bir alan. Burada yazdıklarınızı bu uygulamayı kullanan herkes görebilir — lütfen kişisel bilgilerinizi (telefon, adres vb.) paylaşmayın.</div>
        <Card>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>Önce bir takma ad seçin</div>
          <input placeholder="Örn. Ayşe Anne" value={nickInput} onChange={e=>setNickInput(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={saveNickname} disabled={!nickInput.trim()}>Sohbete Katıl</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div style={{padding:"20px 20px 10px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:0}}>Anne Sohbeti</h2>
        <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:4}}>{nickname} olarak yazıyorsunuz · herkese açık paylaşımlı alan</div>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"6px 16px"}} className="abp-scrollbar">
        {loading ? (
          <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
        ) : messages.length === 0 ? (
          <div style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13,marginTop:30}}>Henüz mesaj yok. İlk mesajı sen yaz!</div>
        ) : messages.map(m=>{
          const mine = m.name === nickname;
          return (
            <div key={m.id} style={{display:"flex",justifyContent: mine?"flex-end":"flex-start", marginBottom:10}}>
              <div className="abp-fade-up" style={{maxWidth:"78%"}}>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:2,marginLeft: mine?0:4,marginRight: mine?4:0,textAlign: mine?"right":"left"}}>{m.name}</div>
                <div style={{
                  padding:"9px 13px", borderRadius: mine?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background: mine ? "linear-gradient(135deg, #E8A9C4, #B79AEA)" : "var(--card)",
                  color: mine ? "#fff" : "var(--ink)", fontSize:12.5, lineHeight:1.45, boxShadow:"var(--shadow-sm)", whiteSpace:"pre-wrap"
                }}>{m.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position:"absolute",bottom:78,left:16,right:16,display:"flex",gap:8,alignItems:"center",background:"var(--card)",borderRadius:20,padding:"8px 8px 8px 16px",boxShadow:"var(--shadow)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Bir mesaj yaz..." disabled={sending}
          style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:14,color:"var(--ink)"}}/>
        <div onClick={send} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: sending?"var(--ink-faint)":"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Send size={15} color="#fff"/>
        </div>
      </div>
    </div>
  );
}

function AssistantTab() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);

  useEffect(()=>{
    (async ()=>{
      const saved = await storageGet("assistant:conversations", false);
      if (saved && saved.length) {
        setConversations(saved);
        setActiveId(saved[0].id);
      } else {
        const c = newConversation();
        setConversations([c]);
        setActiveId(c.id);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; },[conversations, activeId, sending]);

  const persist = (list) => { setConversations(list); storageSet("assistant:conversations", list, false); };
  const active = conversations.find(c=>c.id===activeId);

  const send = async () => {
    if (!input.trim() || sending || !active) return;
    const text = input.trim();
    setInput("");
    setError(null);
    const userMsg = {role:"user", text};
    const updatedMsgs = [...active.messages, userMsg];
    const title = active.title === "Yeni Sohbet" ? text.slice(0,32) : active.title;
    let list = conversations.map(c => c.id===activeId ? {...c, messages:updatedMsgs, title, updatedAt:Date.now()} : c);
    persist(list);
    setSending(true);
    try {
      const res = await callGemini(
        ASSISTANT_SYSTEM_PROMPT,
        updatedMsgs.map(m => ({role: m.role==="bot" ? "assistant" : "user", content: m.text}))
      );
      if (!res.ok) throw new Error(res.error || "gemini_failed");
      const botText = res.text.trim() || "Şu anda yanıt üretemedim, tekrar dener misiniz?";
      list = list.map(c => c.id===activeId ? {...c, messages:[...updatedMsgs, {role:"bot", text:botText}], updatedAt:Date.now()} : c);
      persist(list);
    } catch (e) {
      setError("Yanıt alınamadı. Bağlantınızı kontrol edip tekrar deneyin.");
      showToast("Asistan yanıt veremedi", "error");
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    const c = newConversation();
    const list = [c, ...conversations];
    persist(list);
    setActiveId(c.id);
    setShowHistory(false);
  };
  const deleteConversation = (id) => {
    const list = conversations.filter(c=>c.id!==id);
    const finalList = list.length ? list : [newConversation()];
    persist(finalList);
    if (id === activeId) setActiveId(finalList[0].id);
  };

  if (loading || !active) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px 20px 110px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>Yapay Zeka Anne Asistanı</h2>
        <SkeletonCard lines={1}/><SkeletonCard lines={1}/><SkeletonCard lines={1}/>
      </div>
    );
  }

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div style={{padding:"20px 20px 10px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:0}}>Yapay Zeka Anne Asistanı</h2>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",marginTop:4}}>Sadece bilgilendirme amaçlıdır, tanı koymaz.</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div onClick={()=>setShowHistory(true)} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><Clock size={16}/></div>
          <div onClick={startNewChat} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><Plus size={16}/></div>
        </div>
      </div>
      <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"10px 20px"}} className="abp-scrollbar">
        {active.messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent: m.role==="user"?"flex-end":"flex-start", marginBottom:10}}>
            <div className="abp-fade-up" style={{
              maxWidth:"78%", padding:"12px 15px", borderRadius: m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",
              background: m.role==="user" ? "linear-gradient(135deg, #E8A9C4, #B79AEA)" : "var(--card)",
              color: m.role==="user" ? "#fff" : "var(--ink)", fontSize:13.5, lineHeight:1.5, boxShadow:"var(--shadow-sm)", whiteSpace:"pre-wrap"
            }}>{m.text}</div>
          </div>
        ))}
        {sending && (
          <div style={{display:"flex",justifyContent:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",gap:4,padding:"14px 16px",borderRadius:"18px 18px 18px 4px",background:"var(--card)",boxShadow:"var(--shadow-sm)"}}>
              {[0,1,2].map(i=>(<div key={i} className="abp-typing-dot" style={{width:6,height:6,borderRadius:3,background:"var(--ink-faint)",animationDelay:`${i*0.15}s`}}/>))}
            </div>
          </div>
        )}
        {error && <ErrorBanner text={error} onRetry={()=>{setError(null); send();}}/>}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 16px 100px",flexWrap:"wrap"}}>
        {ASSISTANT_SUGGESTIONS.map(q=>(
          <div key={q} onClick={()=>setInput(q)} className="abp-tap" style={{fontSize:11.5,padding:"7px 12px",borderRadius:99,background:"var(--card)",color:"var(--ink-soft)",boxShadow:"var(--shadow-sm)"}}>{q}</div>
        ))}
      </div>
      <div style={{position:"absolute",bottom:78,left:16,right:16,display:"flex",gap:8,alignItems:"center",background:"var(--card)",borderRadius:20,padding:"8px 8px 8px 16px",boxShadow:"var(--shadow)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Bir şey sorun..." disabled={sending}
          style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:14,color:"var(--ink)"}}/>
        <div onClick={send} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: sending?"var(--ink-faint)":"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Send size={15} color="#fff"/>
        </div>
      </div>

      {showHistory && (
        <Modal title="Geçmiş Sohbetler" onClose={()=>setShowHistory(false)}>
          {conversations.length === 0 ? (
            <div style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13,padding:20}}>Henüz sohbet yok.</div>
          ) : conversations.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div onClick={()=>{setActiveId(c.id); setShowHistory(false);}} className="abp-tap" style={{flex:1,background: c.id===activeId?"var(--pink)":"var(--card)",borderRadius:16,padding:14,boxShadow:"var(--shadow-sm)"}}>
                <div style={{fontWeight:700,fontSize:14}}>{c.title}</div>
                <div style={{fontSize:11.5,color:"var(--ink-soft)",marginTop:3}}>{new Date(c.updatedAt).toLocaleString("tr-TR")} · {c.messages.length} mesaj</div>
              </div>
              <div onClick={()=>deleteConversation(c.id)} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><X size={14}/></div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   ÖDEME YÖNTEMİ — bu demo ortamında gerçek bir ödeme altyapısına
   (iyzico, Stripe, PayTR vb.) bağlı DEĞİLDİR. Kart numarası ve CVV asla
   saklanmaz; yalnızca kartın son 4 hanesi ve sahibinin adı, cihazda
   kalıcı olarak (window.storage) tutulur. Gerçek ödeme almak için bu
   modülün bir ödeme sağlayıcısının resmi SDK/API'siyle backend
   üzerinden entegre edilmesi gerekir.
   ============================================================ */
function PaymentMethodModal({onClose}) {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("payment:methods", false);
    setMethods(saved || []);
    setLoading(false);
  })(); }, []);

  const formatNumber = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,"").slice(0,4);
    return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d;
  };
  const digitsOnly = number.replace(/\D/g,"");
  const valid = holder.trim().length>1 && digitsOnly.length===16 && /^\d{2}\/\d{2}$/.test(expiry) && cvc.length>=3;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const method = {
      id: Date.now(),
      holder: holder.trim(),
      last4: digitsOnly.slice(-4),
      expiry,
      brand: digitsOnly.startsWith("4") ? "Visa" : digitsOnly.startsWith("5") ? "Mastercard" : "Kart"
    };
    const list = [...methods, method];
    const ok = await storageSet("payment:methods", list, false);
    if (ok) {
      setMethods(list); setHolder(""); setNumber(""); setExpiry(""); setCvc("");
      showToast("Ödeme yöntemi eklendi ✓ (demo — gerçek tahsilat yapılmaz)");
    } else showToast("Kaydedilemedi, tekrar deneyin", "error");
    setSaving(false);
  };

  const remove = async (id) => {
    const list = methods.filter(m=>m.id!==id);
    setMethods(list);
    await storageSet("payment:methods", list, false);
  };

  return (
    <Modal title="Ödeme Yöntemi" onClose={onClose}>
      <div style={{fontSize:12,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14,background:"var(--bg)",padding:12,borderRadius:14}}>
        Bu demo ortamında gerçek bir ödeme altyapısı bağlı değildir; hiçbir tahsilat yapılmaz. Kart numaranız ve güvenlik kodunuz cihazınızda saklanmaz, yalnızca kartın son 4 hanesi görüntüleme amacıyla tutulur. Gerçek ödeme almak için bir ödeme sağlayıcısı (ör. iyzico, Stripe, PayTR) ile sunucu tarafında entegrasyon gerekir.
      </div>

      {!loading && methods.length > 0 && (
        <>
          <div style={{fontWeight:700,fontSize:13.5,marginBottom:8}}>Kayıtlı Yöntemler</div>
          {methods.map(m=>(
            <Card key={m.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
              <IconBadge icon={Crown} color="purple" size={34}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13.5}}>{m.brand} •••• {m.last4}</div>
                <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{m.holder} · SKT {m.expiry}</div>
              </div>
              <div onClick={()=>remove(m.id)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
            </Card>
          ))}
        </>
      )}

      <div style={{fontWeight:700,fontSize:13.5,margin:"14px 0 8px"}}>Yeni Kart Ekle</div>
      <input placeholder="Kart Üzerindeki İsim" value={holder} onChange={e=>setHolder(e.target.value)}
        style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
      <input placeholder="Kart Numarası" inputMode="numeric" value={number} onChange={e=>setNumber(formatNumber(e.target.value))}
        style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
      <div style={{display:"flex",gap:10}}>
        <input placeholder="AA/YY" inputMode="numeric" value={expiry} onChange={e=>setExpiry(formatExpiry(e.target.value))}
          style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder="CVC" inputMode="numeric" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,"").slice(0,4))}
          style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
      </div>
      <PrimaryButton onClick={save} disabled={!valid||saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Kartı Kaydet"}</PrimaryButton>
    </Modal>
  );
}

/* ============================================================
   İSİM DEĞİŞTİRME MODALI (Anne adı / çocuk adı için ortak)
   ============================================================ */
function RenameModal({title, initialValue, placeholder, onSave, onClose}) {
  const [val, setVal] = useState(initialValue || "");
  const save = () => {
    const trimmed = val.trim();
    if (!trimmed) return;
    onSave(trimmed);
    onClose();
  };
  return (
    <Modal title={title} onClose={onClose}>
      <Input label="İsim" value={val} onChange={setVal} placeholder={placeholder || "İsim girin"}/>
      <PrimaryButton style={{marginTop:14, padding:12, fontSize:13.5}} onClick={save} disabled={!val.trim()}>
        Kaydet
      </PrimaryButton>
    </Modal>
  );
}

/* ============================================================
   PROFILE TAB (içinde Ayarlar menüsü de yer alır)
   ============================================================ */
function ProfileTab({children, onAddChild, onRemoveChild, onRenameChild, onOpenChildProfile, theme, setTheme, onOpenAdmin, onOpenCalendar, onLogout}) {
  const [reminders, setReminders] = useState([
    {label:"Doktor Randevusu", time:"Yarın 10:00", on:true},
    {label:"Vitamin Hatırlatması", time:"Her gün 09:00", on:true},
    {label:"Su İçme", time:"Her 2 saatte", on:false},
    {label:"Aşı Takibi", time:"Otomatik", on:true},
  ]);
  const [showPayment, setShowPayment] = useState(false);
  const [momName, setMomName] = useState("Anne Adı");
  const [editMom, setEditMom] = useState(false);
  const [renameChild, setRenameChild] = useState(null);

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("profile:mom", false);
    if (saved && saved.name) setMomName(saved.name);
  })(); }, []);

  const saveMomName = async (val) => {
    setMomName(val);
    await storageSet("profile:mom", {name: val}, false);
    showToast("Adınız güncellendi ✓");
  };

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 16px"}}>Profil</h2>
      <Card style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}} onClick={()=>setEditMom(true)}>
        <div style={{width:60,height:60,borderRadius:30,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <User size={26}/>
          <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:11,background:"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}><Camera size={11} color="#fff"/></div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:16}}>{momName}</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>anne@ornek.com</div>
        </div>
        <Edit3 size={17} color="var(--ink-faint)"/>
      </Card>
      {editMom && (
        <RenameModal
          title="Adınızı Değiştirin"
          initialValue={momName}
          placeholder="Adınız"
          onClose={()=>setEditMom(false)}
          onSave={saveMomName}
        />
      )}

      <SectionTitle action={<div onClick={onAddChild} className="abp-tap" style={{display:"flex",alignItems:"center",gap:4,fontSize:12.5,fontWeight:700,color:"var(--ink-soft)"}}><Plus size={14}/>Ekle</div>}>Çocuklarım</SectionTitle>
      {children.map(c=>(
        <Card key={c.id} onClick={()=>onOpenChildProfile && onOpenChildProfile(c)} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <IconBadge icon={c.status==="pregnant"?Baby:Heart} color="blue" size={38}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
            <div style={{fontSize:12,color:"var(--ink-soft)"}}>{c.status==="pregnant"?"Hamilelik takibi":"Doğum sonrası takip"}</div>
          </div>
          <div
            className="abp-tap"
            onClick={(e)=>{ e.stopPropagation(); setRenameChild(c); }}
            style={{width:30,height:30,borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
          >
            <Edit3 size={15} color="var(--ink-faint)"/>
          </div>
          <div
            className="abp-tap"
            onClick={(e)=>{
              e.stopPropagation();
              if (window.confirm(`"${c.name}" profilini silmek istediğinize emin misiniz?`)) {
                onRemoveChild && onRemoveChild(c.id);
              }
            }}
            style={{width:30,height:30,borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
          >
            <X size={15} color="var(--ink-faint)"/>
          </div>
          <ChevronRight size={16} color="var(--ink-faint)"/>
        </Card>
      ))}
      {renameChild && (
        <RenameModal
          title={`"${renameChild.name}" — İsmi Değiştir`}
          initialValue={renameChild.name}
          placeholder="Çocuğunuzun adı"
          onClose={()=>setRenameChild(null)}
          onSave={(val)=>{ onRenameChild && onRenameChild(renameChild.id, val); showToast("İsim güncellendi ✓"); }}
        />
      )}

      <SectionTitle>Premium</SectionTitle>
      <Card style={{background:"linear-gradient(135deg, var(--purple), var(--pink))"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <Crown size={20}/><div style={{fontWeight:800,fontSize:15}}>Premium'a Geç</div>
        </div>
        <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.7}}>
          Reklamsız kullanım · Sınırsız AI · Detaylı raporlar · Premium sesler ve aktiviteler
        </div>
        <PrimaryButton style={{marginTop:12,padding:12,fontSize:13.5}} onClick={()=>setShowPayment(true)}>Ödeme Yöntemi Ekle</PrimaryButton>
      </Card>

      <SectionTitle>Takvim</SectionTitle>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}} onClick={onOpenCalendar}>
        <IconBadge icon={CalendarDays} color="pink" size={34}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5}}>Randevu ve Etkinlik Takvimi</div>
          <div style={{fontSize:11,color:"var(--ink-soft)",marginTop:2}}>Doktor randevuları, aşılar ve önemli tarihler</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>

      {showPayment && <PaymentMethodModal onClose={()=>setShowPayment(false)}/>}

      <SectionTitle>Hatırlatıcılar</SectionTitle>
      {reminders.map((r,i)=>(
        <Card key={i} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
          <IconBadge icon={Bell} color="green" size={34}/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>{r.label}</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{r.time}</div></div>
          <div onClick={()=>{setReminders(rs=>rs.map((x,idx)=>idx===i?{...x,on:!x.on}:x)); showToast(reminders[i].on?"Hatırlatıcı kapatıldı":"Hatırlatıcı açıldı ✓");}} className="abp-tap" style={{width:42,height:24,borderRadius:12,background: r.on?"var(--ink)":"var(--ink-faint)",padding:2,display:"flex",justifyContent:r.on?"flex-end":"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:10,background:"#fff"}}/>
          </div>
        </Card>
      ))}

      <SectionTitle>Yönetim</SectionTitle>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}} onClick={onOpenAdmin}>
        <IconBadge icon={Settings} color="blue" size={34}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5}}>Yönetici Paneli (Demo)</div>
          <div style={{fontSize:11,color:"var(--ink-soft)",marginTop:2}}>Makale, aktivite, ses ve ninni ekle</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>

      <SectionTitle>Ayarlar</SectionTitle>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}} onClick={()=>setTheme(theme==="light"?"dark":"light")}>
        <IconBadge icon={theme==="light"?Sun:Moon} color="purple" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>{theme==="light"?"Açık Tema":"Koyu Tema"}</div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      <Card
        style={{display:"flex",alignItems:"center",gap:12,color:"#D98BA6"}}
        onClick={()=>{
          if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
            onLogout && onLogout();
          }
        }}
      >
        <IconBadge icon={LogOut} color="pink" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>Çıkış Yap</div>
      </Card>
    </div>
  );
}

/* ============================================================
   ANNE PAZARI — Trendyol Dolap mantığında, annelerin çocuk kıyafeti /
   eşyalarını 2. el olarak satışa çıkardığı, tüm kullanıcılar arasında
   paylaşılan bir ilan panosu.
   İlanlar shared=true ile herkese açık saklanır; "İlanlarım" (kime ait
   olduğu) bilgisi shared=false ile sadece o kullanıcının cihazında/
   hesabında tutulur, böylece yalnızca kendi ilanını düzenleyip
   silebilir/satıldı olarak işaretleyebilir.
   ============================================================ */
const MARKET_CATEGORIES = [
  {key:"kiyafet", label:"Kıyafet", icon: ShoppingBag, color:"pink"},
  {key:"ayakkabi", label:"Ayakkabı", icon: Ruler, color:"blue"},
  {key:"oyuncak", label:"Oyuncak", icon: Sparkles, color:"purple"},
  {key:"araba", label:"Bebek Arabası & Oto Koltuğu", icon: Car, color:"green"},
  {key:"mama", label:"Mama & Beslenme", icon: Utensils, color:"pink"},
  {key:"mobilya", label:"Mobilya & Uyku", icon: Home, color:"blue"},
  {key:"kitap", label:"Kitap & Eğitim", icon: BookOpen, color:"purple"},
  {key:"diger", label:"Diğer", icon: Award, color:"green"}
];
const MARKET_CONDITIONS = ["Yeni / Etiketli","Az Kullanılmış","Kullanılmış - İyi Durumda"];

function marketCategoryMeta(key) {
  return MARKET_CATEGORIES.find(c=>c.key===key) || MARKET_CATEGORIES[MARKET_CATEGORIES.length-1];
}
function formatTL(n) {
  const num = Number(n)||0;
  return num.toLocaleString("tr-TR") + " ₺";
}

function MarketTab({onBack}) {
  const [nickname, setNickname] = useState(null);
  const [nickInput, setNickInput] = useState("");
  const [loadingNick, setLoadingNick] = useState(true);

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [myIds, setMyIds] = useState([]);
  const [favIds, setFavIds] = useState([]);

  const [view, setView] = useState("browse"); // browse | mine | favs
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);

  const [pTitle, setPTitle] = useState("");
  const [pCategory, setPCategory] = useState("kiyafet");
  const [pSize, setPSize] = useState("");
  const [pCondition, setPCondition] = useState(MARKET_CONDITIONS[1]);
  const [pPrice, setPPrice] = useState("");
  const [pCity, setPCity] = useState("");
  const [pDesc, setPDesc] = useState("");

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("profile:nickname", false);
    if (saved && saved.name) setNickname(saved.name);
    setLoadingNick(false);
  })(); }, []);

  const loadAll = async () => {
    const [list, mine, favs] = await Promise.all([
      storageGet("market:listings", true),
      storageGet("market:my_listings", false),
      storageGet("market:favorites", false)
    ]);
    setListings((list || []).slice().sort((a,b)=>b.createdAt-a.createdAt));
    setMyIds(mine || []);
    setFavIds(favs || []);
    setLoading(false);
  };
  useEffect(()=>{ if (nickname) loadAll(); }, [nickname]);

  const saveNickname = async () => {
    if (!nickInput.trim()) return;
    const val = {name: nickInput.trim().slice(0,24)};
    await storageSet("profile:nickname", val, false);
    setNickname(val.name);
    showToast("Takma adınız kaydedildi ✓");
  };

  const resetForm = () => {
    setPTitle(""); setPCategory("kiyafet"); setPSize(""); setPCondition(MARKET_CONDITIONS[1]);
    setPPrice(""); setPCity(""); setPDesc("");
  };

  const postListing = async () => {
    if (!pTitle.trim() || !pPrice || posting) return;
    setPosting(true);
    const item = {
      id: Math.random().toString(36).slice(2)+Date.now().toString(36),
      title: pTitle.trim().slice(0,60),
      category: pCategory,
      size: pSize.trim().slice(0,30),
      condition: pCondition,
      price: Number(pPrice)||0,
      city: pCity.trim().slice(0,40),
      desc: pDesc.trim().slice(0,400),
      seller: nickname,
      sold: false,
      createdAt: Date.now()
    };
    const latestList = await storageGet("market:listings", true) || [];
    const newList = [item, ...latestList];
    const ok1 = await storageSet("market:listings", newList, true);
    const latestMine = await storageGet("market:my_listings", false) || [];
    const newMine = [item.id, ...latestMine];
    const ok2 = await storageSet("market:my_listings", newMine, false);
    if (ok1 && ok2) {
      setListings(newList.slice().sort((a,b)=>b.createdAt-a.createdAt));
      setMyIds(newMine);
      resetForm();
      setShowPost(false);
      showToast("İlanınız yayınlandı ✓");
    } else {
      showToast("İlan yayınlanamadı, tekrar deneyin", "error");
    }
    setPosting(false);
  };

  const updateListing = async (id, patch) => {
    const latestList = await storageGet("market:listings", true) || [];
    const newList = latestList.map(l=> l.id===id ? {...l, ...patch} : l);
    const ok = await storageSet("market:listings", newList, true);
    if (ok) {
      setListings(newList.slice().sort((a,b)=>b.createdAt-a.createdAt));
      if (selected && selected.id===id) setSelected({...selected, ...patch});
    } else showToast("İşlem başarısız, tekrar deneyin", "error");
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) return;
    const latestList = await storageGet("market:listings", true) || [];
    const newList = latestList.filter(l=>l.id!==id);
    const ok1 = await storageSet("market:listings", newList, true);
    const newMine = myIds.filter(x=>x!==id);
    const ok2 = await storageSet("market:my_listings", newMine, false);
    if (ok1 && ok2) {
      setListings(newList.slice().sort((a,b)=>b.createdAt-a.createdAt));
      setMyIds(newMine);
      setSelected(null);
      showToast("İlan silindi");
    } else showToast("Silinemedi, tekrar deneyin", "error");
  };

  const toggleFav = async (id) => {
    const next = favIds.includes(id) ? favIds.filter(x=>x!==id) : [...favIds, id];
    setFavIds(next);
    await storageSet("market:favorites", next, false);
  };

  if (loadingNick) {
    return (
      <Screen title="Anne Pazarı" onBack={onBack}>
        <SkeletonCard/>
      </Screen>
    );
  }

  if (!nickname) {
    return (
      <Screen title="Anne Pazarı" onBack={onBack}>
        <Card style={{textAlign:"center"}}>
          <IconBadge icon={ShoppingBag} color="pink" size={48}/>
          <div style={{fontWeight:800,fontSize:15.5,margin:"12px 0 6px"}}>Anne Pazarı'na Hoş Geldiniz</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:14,lineHeight:1.5}}>İlan verebilmek ve satıcılarla görünür olabilmek için önce bir takma ad belirleyin. Bu ad, tüm ilanlarınızda görünecek.</div>
          <input placeholder="Örn. Ayşe Anne" value={nickInput} onChange={e=>setNickInput(e.target.value)}
            style={{width:"100%",padding:"14px 16px",borderRadius:16,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:14.5,color:"var(--ink)",outline:"none",marginBottom:12,textAlign:"center"}}/>
          <PrimaryButton onClick={saveNickname} disabled={!nickInput.trim()}>Devam Et</PrimaryButton>
        </Card>
      </Screen>
    );
  }

  const visible = listings.filter(l=>{
    if (view==="mine" && !myIds.includes(l.id)) return false;
    if (view==="favs" && !favIds.includes(l.id)) return false;
    if (category!=="all" && l.category!==category) return false;
    if (query.trim() && !l.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <Screen title="Anne Pazarı" onBack={onBack} right={
      <div onClick={()=>setShowPost(true)} className="abp-tap" style={{width:36,height:36,borderRadius:18,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Plus size={18}/>
      </div>
    }>
      <div style={{fontSize:12,color:"var(--ink-faint)",marginBottom:12,lineHeight:1.5}}>
        Annelerin çocuk kıyafeti, ayakkabı ve eşyalarını 2. el olarak alıp sattığı ortak pano. Alışveriş öncesi ürünü ve satıcıyı dikkatle değerlendirin.
      </div>

      <input placeholder="İlanlarda ara..." value={query} onChange={e=>setQuery(e.target.value)}
        style={{width:"100%",padding:"13px 16px",borderRadius:16,border:"1px solid rgba(150,130,180,0.18)",background:"var(--card)",fontSize:14,color:"var(--ink)",outline:"none",marginBottom:12}}/>

      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <Pill_ active={view==="browse"} onClick={()=>setView("browse")}>Tüm İlanlar</Pill_>
        <Pill_ active={view==="favs"} onClick={()=>setView("favs")}>Favorilerim</Pill_>
        <Pill_ active={view==="mine"} onClick={()=>setView("mine")}>İlanlarım</Pill_>
      </div>

      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}} className="abp-scrollbar">
        <Pill_ active={category==="all"} onClick={()=>setCategory("all")}>Tümü</Pill_>
        {MARKET_CATEGORIES.map(c=>(
          <Pill_ key={c.key} active={category===c.key} onClick={()=>setCategory(c.key)}>{c.label}</Pill_>
        ))}
      </div>

      {loading ? (
        <><SkeletonCard/><SkeletonCard/><SkeletonCard/></>
      ) : visible.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>
          {view==="mine" ? "Henüz bir ilanınız yok." : view==="favs" ? "Favori ilanınız yok." : "Bu filtrelerde ilan bulunamadı."}
        </Card>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {visible.map(l=>{
            const meta = marketCategoryMeta(l.category);
            const isFav = favIds.includes(l.id);
            const mine = myIds.includes(l.id);
            return (
              <Card key={l.id} className="abp-fade-up" style={{padding:14, opacity: l.sold?0.55:1}} onClick={()=>setSelected(l)}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <IconBadge icon={meta.icon} color={meta.color} size={36}/>
                  <Star size={16} fill={isFav?"#F0A8C6":"none"} color="#F0A8C6" onClick={(e)=>{e.stopPropagation(); toggleFav(l.id);}}/>
                </div>
                <div style={{fontWeight:700,fontSize:13,marginTop:8,lineHeight:1.3}}>{l.title}</div>
                <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{l.size || meta.label}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                  <div style={{fontWeight:800,fontSize:14.5}} className="abp-display">{formatTL(l.price)}</div>
                  {l.sold && <span style={{fontSize:9.5,fontWeight:800,color:"var(--white)",background:"#B79AEA",padding:"3px 7px",borderRadius:99}}>SATILDI</span>}
                  {!l.sold && mine && <span style={{fontSize:9.5,fontWeight:800,color:"var(--ink-soft)",background:"var(--bg)",padding:"3px 7px",borderRadius:99}}>İLANIM</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <Modal title={selected.title} onClose={()=>setSelected(null)}>
          {(() => {
            const meta = marketCategoryMeta(selected.category);
            const mine = myIds.includes(selected.id);
            return (
              <>
                <IconBadge icon={meta.icon} color={meta.color} size={48}/>
                <div style={{fontWeight:800,fontSize:20,margin:"12px 0 2px"}} className="abp-display">{formatTL(selected.price)}</div>
                {selected.sold && <div style={{fontSize:11.5,fontWeight:800,color:"#B79AEA",marginBottom:6}}>Bu ürün satıldı</div>}
                <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"10px 0"}}>
                  <span style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"5px 10px",borderRadius:99}}>{meta.label}</span>
                  {selected.size && <span style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"5px 10px",borderRadius:99}}>Beden/Ölçü: {selected.size}</span>}
                  <span style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"5px 10px",borderRadius:99}}>{selected.condition}</span>
                  {selected.city && <span style={{fontSize:11.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"5px 10px",borderRadius:99}}><MapPin size={11} style={{verticalAlign:-1,marginRight:3}}/>{selected.city}</span>}
                </div>
                {selected.desc && <p style={{fontSize:13.5,lineHeight:1.6,color:"var(--ink)"}}>{selected.desc}</p>}
                <div style={{fontSize:12.5,color:"var(--ink-faint)",marginTop:10}}>Satıcı: <b style={{color:"var(--ink)"}}>{selected.seller}</b></div>

                {mine ? (
                  <div style={{display:"flex",gap:10,marginTop:18}}>
                    <GhostButton style={{flex:1}} onClick={()=>updateListing(selected.id,{sold:!selected.sold})}>
                      {selected.sold ? "Tekrar Yayınla" : "Satıldı İşaretle"}
                    </GhostButton>
                    <GhostButton style={{flex:1,color:"#D98BA6"}} onClick={()=>deleteListing(selected.id)}>Sil</GhostButton>
                  </div>
                ) : (
                  <div style={{fontSize:12,color:"var(--ink-faint)",marginTop:18,lineHeight:1.5}}>
                    Satıcıyla iletişime geçmek için Anne Sohbeti üzerinden takma adını arayarak mesaj bırakabilirsiniz.
                  </div>
                )}
              </>
            );
          })()}
        </Modal>
      )}

      {showPost && (
        <Modal title="Yeni İlan Ver" onClose={()=>{ if(!posting) setShowPost(false); }}>
          <Input label="Ürün Başlığı" value={pTitle} onChange={setPTitle} placeholder="Örn. 3-6 ay kız bebek tulum seti"/>
          <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:6}}>Kategori</div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}} className="abp-scrollbar">
            {MARKET_CATEGORIES.map(c=>(
              <Pill_ key={c.key} active={pCategory===c.key} onClick={()=>setPCategory(c.key)}>{c.label}</Pill_>
            ))}
          </div>
          <Input label="Beden / Ölçü (opsiyonel)" value={pSize} onChange={setPSize} placeholder="Örn. 68 (3-6 ay) / 22 numara"/>
          <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:6}}>Durumu</div>
          <div style={{display:"flex",gap:8,paddingBottom:4,marginBottom:14}}>
            {MARKET_CONDITIONS.map(c=>(
              <Pill_ key={c} active={pCondition===c} onClick={()=>setPCondition(c)}>{c}</Pill_>
            ))}
          </div>
          <Input label="Fiyat (₺)" value={pPrice} onChange={v=>setPPrice(v.replace(/[^0-9]/g,""))} placeholder="Örn. 150" type="text"/>
          <Input label="Şehir / İlçe (opsiyonel)" value={pCity} onChange={setPCity} placeholder="Örn. Balıkesir, Merkez"/>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:6}}>Açıklama (opsiyonel)</div>
            <textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Ürün hakkında kısaca bilgi verin..." rows={3}
              style={{width:"100%",padding:"14px 16px",borderRadius:16,border:"1px solid rgba(150,130,180,0.18)",background:"var(--card)",fontSize:14,color:"var(--ink)",outline:"none",resize:"none",fontFamily:"inherit"}}/>
          </div>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:14,lineHeight:1.5}}>İlanınız "{nickname}" takma adıyla ve tüm kullanıcılara açık olarak yayınlanacaktır.</div>
          <PrimaryButton onClick={postListing} disabled={!pTitle.trim()||!pPrice||posting}>{posting?"Yayınlanıyor...":"İlanı Yayınla"}</PrimaryButton>
        </Modal>
      )}
    </Screen>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [phase, setPhase] = useState("boot"); // boot | onboarding | auth | setup | main
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [detail, setDetail] = useState(null); // "pregnancy" | "child"
  const [theme, setTheme] = useState("light");
  const [authUser, setAuthUser] = useState(null);

  const activeChild = children.find(c=>c.id===activeChildId) || children[0];

  // Oturum durumunu izle; gerçek (anonim olmayan) bir kullanıcı zaten
  // giriş yapmışsa onboarding/auth ekranlarını tekrar göstermeden
  // doğrudan kayıtlı profillerini yükle.
  useEffect(()=>{
    // Sesli okuma (hikaye/ninni) motorunun ses listesini erkenden ısıtır;
    // bazı tarayıcılarda ilk "oynat" tıklamasında sessiz kalma sorununu azaltır.
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(()=>{
    // Google girişi popup engellendiği için sayfa yönlendirmeli (redirect)
    // akışına düştüyse, kullanıcı Google'dan geri döndüğünde sonucu burada
    // işleriz. watchAuthState zaten sonucu onAuthStateChanged üzerinden
    // yakalayacaktır; burada sadece olası hataları loglamak için çağırıyoruz.
    handleRedirectResult().catch(()=>{});
    const unsub = watchAuthState(async (user) => {
      setAuthUser(user);
      if (user.isAnonymous) {
        setPhase("onboarding");
        return;
      }
      const savedChildren = await storageGet("profile:children", false);
      if (savedChildren && savedChildren.length) {
        setChildren(savedChildren);
        setActiveChildId(savedChildren[0].id);
        setPhase("main");
      } else {
        setPhase("setup");
      }
    });
    return () => unsub && unsub();
  }, []);

  useEffect(()=>{
    if (children.length) storageSet("profile:children", children, false);
  }, [children]);

  if (phase === "boot") {
    return (
      <div style={{width:"100%",maxWidth:420,height:780,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",borderRadius:36}}>
        <GlobalStyle/>
        <Heart size={32} color="var(--ink-faint)"/>
      </div>
    );
  }

  return (
    <div className={`abp-root ${theme==="dark"?"dark":""}`} style={{
      width:"100%", maxWidth:420, height:780, margin:"0 auto", position:"relative",
      overflow:"hidden", borderRadius:36, boxShadow:"0 30px 60px -20px rgba(60,40,90,0.35)",
      background:"var(--bg)"
    }}>
      <GlobalStyle/>
      <ToastHost/>

      {phase === "onboarding" && <Onboarding onDone={()=>setPhase("auth")}/>}

      {phase === "auth" && <AuthScreen onDone={()=>setPhase("setup")}/>}

      {phase === "setup" && (
        <SetupWizard onDone={(list)=>{ setChildren(list); setActiveChildId(list[0]?.id); setPhase("main"); }}/>
      )}

      {phase === "main" && (
        <div style={{height:"100%",position:"relative"}}>
          {detail === "pregnancy" && activeChild ? (
            <PregnancyDetail child={activeChild} onBack={()=>setDetail(null)}/>
          ) : detail === "child" && activeChild ? (
            <ChildDetail child={activeChild} onBack={()=>setDetail(null)}/>
          ) : detail === "admin" ? (
            <AdminPanel onBack={()=>setDetail(null)}/>
          ) : detail === "calendar" ? (
            <CalendarDetail onBack={()=>setDetail(null)}/>
          ) : detail === "market" ? (
            <MarketTab onBack={()=>setDetail(null)}/>
          ) : (
            <>
              {activeTab === "today" && (
                <TodayTab
                  child={activeChild}
                  onOpenPregnancy={()=>setDetail("pregnancy")}
                  onOpenChild={()=>setDetail("child")}
                  onOpenMarket={()=>setDetail("market")}
                />
              )}
              {activeTab === "track" && <TrackTab child={activeChild}/>}
              {activeTab === "activities" && <ActivitiesTab/>}
              {activeTab === "nearby" && <NearbyTab/>}
              {activeTab === "community" && <CommunityChat/>}
              {activeTab === "assistant" && <AssistantTab/>}
              {activeTab === "profile" && (
                <ProfileTab
                  children={children}
                  theme={theme}
                  setTheme={setTheme}
                  onOpenAdmin={()=>setDetail("admin")}
                  onOpenCalendar={()=>setDetail("calendar")}
                  onOpenChildProfile={(c)=>{
                    setActiveChildId(c.id);
                    setDetail(c.status==="pregnant" ? "pregnancy" : "child");
                  }}
                  onAddChild={()=>{
                    const name = "Yeni Profil";
                    const nc = {id:Date.now(), name, status:"pregnant", lmp: todayISO()};
                    setChildren([...children, nc]);
                    setActiveChildId(nc.id);
                    setDetail("pregnancy");
                    showToast("Yeni profil eklendi ✓");
                  }}
                  onRenameChild={(id, newName)=>{
                    setChildren(cs=>cs.map(c=>c.id===id ? {...c, name:newName} : c));
                  }}
                  onRemoveChild={(id)=>{
                    setChildren(cs=>{
                      const remaining = cs.filter(c=>c.id!==id);
                      if (activeChildId===id) setActiveChildId(remaining[0]?.id ?? null);
                      return remaining;
                    });
                    showToast("Profil silindi");
                  }}
                  onLogout={async ()=>{
                    try {
                      await signOutUser();
                      setChildren([]);
                      setActiveChildId(null);
                      setDetail(null);
                      setActiveTab("today");
                      // watchAuthState, oturum kapandığını yakalayıp otomatik
                      // olarak yeni bir anonim oturum açacak; bu da phase'i
                      // "onboarding" yapıp Auth ekranına (Google ile Giriş
                      // dahil) yeniden dönmemizi sağlayacak.
                      showToast("Çıkış yapıldı");
                    } catch (e) {
                      showToast("Çıkış yapılamadı, tekrar deneyin", "error");
                    }
                  }}
                />
              )}
              <BottomNav active={activeTab} onChange={setActiveTab}/>
            </>
          )}
        </div>
      )}
    </div>
  );
}
