import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from "react";
import { callGemini } from "./services/geminiService.js";
import { signInWithGoogle, signInWithApple, registerWithEmail, signInWithEmail, resetPassword, watchAuthState, signOutUser, handleRedirectResult } from "./services/auth.js";
import { auth, db } from "./services/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
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
   ARAYÜZ METİNLERİ (Türkçe) — `t("anahtar")` çağrısı UI_TEXT
   sözlüğünden karşılık gelen metni döndürür; karşılık yoksa
   anahtarın kendisine düşer.
   ============================================================ */
function localeOf() { return "tr-TR"; }

const UI_TEXT = {
  tr: {
    // Alt gezinme
    nav_today: "Bugün", nav_track: "Takip", nav_activities: "Aktiviteler",
    nav_nearby: "Yakınımda", nav_community: "Topluluk", nav_assistant: "Asistan", nav_profile: "Profil",
    // Genel
    save: "Kaydet", cancel: "İptal", close: "Kapat", add: "Ekle", delete: "Sil", edit: "Düzenle",
    back: "Geri", loading: "Yükleniyor...", search: "Ara", done: "Tamam", confirm: "Onayla",
    // Profil ekranı
    profile_title: "Profil",
    profile_children_title: "Çocuklarım",
    profile_add: "Ekle",
    profile_pregnancy_tracking: "Hamilelik takibi",
    profile_postnatal_tracking: "Doğum sonrası takip",
    profile_premium_title: "Premium",
    profile_premium_active_title: "Premium Aktif ✓",
    profile_premium_active_desc: "Sınırsız AI asistan, reklamsız kullanım ve tüm premium içerikler açık.",
    profile_premium_upgrade: "Premium'a Geç",
    profile_premium_desc: "Reklamsız kullanım · Sınırsız AI · Detaylı raporlar · Premium sesler ve aktiviteler",
    profile_premium_btn: "Ödeme Yöntemi Ekle",
    profile_calendar_title: "Takvim",
    profile_calendar_card_title: "Randevu ve Etkinlik Takvimi",
    profile_calendar_card_desc: "Doktor randevuları, aşılar ve önemli tarihler",
    profile_market_title: "WordBabe Satış",
    profile_market_desc: "2. el bebek ve çocuk eşyaları alışveriş pazarı",
    profile_reminders_title: "Hatırlatıcılar",
    reminder_add_btn: "Ekle",
    reminder_modal_title: "Hatırlatıcı",
    reminder_label_label: "Hatırlatıcı adı",
    reminder_label_placeholder: "Örn. Doktor Randevusu",
    reminder_date_label: "Tarih",
    reminder_time_label: "Saat",
    reminder_repeat_label: "Tekrar",
    reminder_repeat_none: "Tek seferlik",
    reminder_repeat_daily: "Her gün",
    reminder_save: "Kaydet",
    reminder_delete: "Hatırlatıcıyı Sil",
    reminder_notif_hint: "Saat belirlersen, o an uygulama açıkken bildirim ve uyarı alırsın.",
    profile_settings_title: "Ayarlar",
    profile_theme_light: "Açık Tema",
    profile_theme_dark: "Koyu Tema",
    profile_about: "Hakkımızda",
    profile_privacy: "Gizlilik Politikası (KVKK)",
    profile_logout: "Çıkış Yap",
    profile_logout_confirm: "Çıkış yapmak istediğinize emin misiniz?",
    profile_mom_name_placeholder: "Adınız",
    profile_mom_name_modal_title: "Adınızı Değiştirin",
    profile_child_rename_placeholder: "Çocuğunuzun adı",
    profile_child_remove_confirm: (name)=>`"${name}" profilini silmek istediğinize emin misiniz?`,
    toast_name_updated: "Adınız güncellendi ✓",
    toast_name_updated2: "İsim güncellendi ✓",
    toast_profile_added: "Yeni profil eklendi ✓",
    toast_profile_removed: "Profil silindi",
    toast_logged_out: "Çıkış yapıldı",
    toast_logout_failed: "Çıkış yapılamadı, tekrar deneyin",
    toast_reminder_on: "Hatırlatıcı açıldı ✓",
    toast_reminder_off: "Hatırlatıcı kapatıldı",
    toast_reminder_saved: "Hatırlatıcı kaydedildi ✓",
    toast_reminder_deleted: "Hatırlatıcı silindi",
    toast_notif_denied: "Bildirim izni verilmedi; hatırlatıcı yalnızca uygulama açıkken uygulama içi uyarı olarak çalışacak",
    new_profile_default_name: "Yeni Profil",
    // Bugün ekranı
    today_greeting: "Merhaba,",
    today_week_label: (w)=>`${w}. Hafta`,
    today_day_fruit: (d,fruit)=>`${d}. gün · Bebeğiniz bugün ${fruit} büyüklüğünde 🤰`,
    today_age_years: (y,m)=>`${y} yaş ${m} ay`,
    today_age_months: (m)=>`${m} aylık`,
    today_child_day: (d)=>`Bebeğiniz bugün ${d}. gününde 👶`,
    today_market_title: "WordBabe Satış",
    today_market_desc: "2. el bebek kıyafeti, oyuncak ve eşyaları keşfet ya da satışa çıkar",
    today_cards_title: "Bugünün Kartları",
    today_cards_refresh_note: "İçerikler her gün otomatik olarak yenilenir.",
    empty_state_default: "Henüz bir çocuk profili eklenmedi.",
    // Takip ekranı
    track_title: "Takip",
    track_sub_weight: "Kilo Takibi", track_sub_kick: "Bebek Tekmesi", track_sub_contraction: "Kasılma Takibi",
    track_sub_appointments: "Randevu Takvimi", track_sub_sleep: "Uyku",
    track_sub_breastfeeding: "Emzirme", track_sub_formula: "Mama", track_sub_foodlist: "Yemek Listesi",
    track_sub_diaper: "Bez", track_sub_poop: "Kaka Takibi", track_sub_teething: "Diş Çıkarma",
    track_sub_vaccine: "Aşı Takvimi", track_sub_weaning: "Ek Gıda", track_sub_regl: "Regl Takvimi",
    tracker_weight_title: "Kilo Takibi", field_weight_kg: "Kilo (kg)",
    tracker_breastfeeding_title: "Emzirme Takibi", field_right_breast: "Sağ Göğüs", field_left_breast: "Sol Göğüs",
    tracker_formula_title: "Mama & Sıvı Takibi", field_formula_ml: "Mama (ml)", field_breastmilk_ml: "Anne Sütü (ml)", field_water_ml: "Su (ml)",
    tracker_sleep_title: "Uyku Takibi", field_duration_min: "Süre (dk)", tracker_sleep_weekly_chart: "Haftalık Uyku Grafiği",
    tracker_diaper_title: "Bez Takibi", diaper_pee: "Çiş", diaper_poop: "Kaka", diaper_both: "İkisi",
    field_note_placeholder: "Not ekle (opsiyonel)",
    history_title: "Geçmiş Kayıtlar",
    history_empty: "Henüz kayıt yok. İlk kaydını ekle!",
    history_empty_generic: "Henüz kayıt yok.",
    toast_saved: "Kaydedildi ✓",
    toast_item_saved: (item)=>`${item} kaydedildi ✓`,
    weight_log_render: (time,kg)=>`${time} · ${kg} kg`,
    breastfeeding_log_render: (time,r,l)=>`${time} · ${r} dk sağ / ${l} dk sol`,
    formula_log_render: (time,f,b,w)=>`${time} · Mama ${f}ml, Anne Sütü ${b}ml, Su ${w}ml`,
    sleep_log_render: (time,min)=>`${time} · ${min} dakika uyudu`,
    diaper_log_render: (time,type)=>`${time} · ${type}`,
    kick_counter_title: "Bebek Tekmesi Sayacı",
    kick_counter_desc: "Genelde 2 saat içinde 10 hareket beklenir",
    kick_counter_movement_count: (min)=>`${min} dk içinde sayılan hareket`,
    reset: "Sıfırla",
    toast_kick_saved: "Tekme sayımı kaydedildi ✓",
    history_empty_kick: "Henüz kayıt yok. İlk sayımını kaydet!",
    kick_log_render: (time,count,min)=>`${time} · ${count} hareket · ${min} dk içinde`,
    contraction_title: "Kasılma Takibi",
    contraction_running: "Kasılma sürüyor…",
    contraction_idle: "Kasılma başladığında butona basın",
    contraction_stop: "Kasılma Bitti",
    contraction_start: "Kasılma Başladı",
    toast_contraction_saved: "Kasılma kaydedildi ✓",
    contraction_warning: "Kasılmalar 5 dakikadan sık, 1 dakikadan uzun sürüyorsa doğum kliniğinizi arayın.",
    contraction_log_render: (time,sec,intervalMin)=>`${time} · ${sec} sn sürdü${intervalMin!=null?` · önceki kasılmadan ${intervalMin} dk sonra`:""}`,
    cms_required_fields: "Zorunlu alanları doldurun",
    cms_add_default: "Ekle",
    cms_empty_default: "Henüz içerik eklenmedi.",
    cms_adding: "Ekleniyor...",
    cms_shared_content: (n)=>`Paylaşımlı İçerik (${n})`,
    toast_content_added: "İçerik eklendi ✓",
    toast_content_add_failed: "Eklenemedi, tekrar deneyin",
    toast_content_removed: "İçerik silindi",
    admin_tab_articles: "Makaleler", admin_tab_activities: "Aktiviteler", admin_tab_sounds: "Uyku Sesleri", admin_tab_lullabies: "Ninniler",
    calendar_title: "Takvim",
    calendar_add_btn: "Randevu / Etkinlik Ekle",
    calendar_empty: "Henüz bir randevu veya etkinlik eklenmedi.",
    calendar_upcoming: "Yaklaşanlar",
    calendar_no_upcoming: "Yaklaşan bir kayıt yok.",
    calendar_past: "Geçmiş",
    calendar_new_event_modal_title: "Yeni Randevu / Etkinlik",
    calendar_title_placeholder: "Başlık (örn. Kadın Doğum Kontrolü)",
    calendar_note_placeholder: "Not (opsiyonel)",
    calendar_saving: "Kaydediliyor...",
    calendar_add_to_calendar: "Takvime Ekle",
    toast_calendar_added: "Takvime eklendi ✓",
    toast_add_failed: "Eklenemedi, tekrar deneyin",
    calendar_type_doctor: "Doktor Randevusu",
    calendar_type_vaccine: "Aşı",
    calendar_type_vitamin: "Vitamin/İlaç",
    calendar_type_other: "Diğer",
    admin_title: "Yönetici Paneli",
    admin_login_title: "Demo Yönetici Girişi",
    admin_login_desc: "Bu bir demo geçiş koduyla korunur (0000), gerçek kimlik doğrulama içermez.",
    admin_code_placeholder: "Geçiş kodu",
    admin_login_btn: "Giriş Yap",
    toast_admin_login_ok: "Giriş yapıldı ✓",
    toast_admin_login_fail: "Kod hatalı",
    admin_add_article: "Makale Ekle", admin_field_title: "Başlık", admin_field_body: "İçerik metni",
    admin_add_activity: "Aktivite Ekle", admin_field_skill: "Geliştirdiği beceri", admin_field_duration: "Süre (örn. 15 dk)", admin_field_materials: "Malzeme",
    admin_add_sound: "Uyku Sesi Ekle", admin_field_sound_name: "Ses adı",
    admin_add_lullaby: "Ninni Ekle", admin_field_category: "Kategori",
    vaccine_schedule_title: "Türkiye Aşı Takvimi",
    vaccine_schedule_desc: (name, birthDate)=>`${name} doğum tarihine (${birthDate}) göre her aşının yapılması gereken tarih otomatik hesaplanır. Yapıldığında karta dokunup tarihini kaydedin — genel bir rehberdir, aile hekiminizin önerdiği program esastır.`,
    default_child_possessive: "Çocuğunuzun",
    vaccine_status_done: "Tamamlandı", vaccine_status_overdue: "Gecikti", vaccine_status_upcoming: "Yaklaşıyor", vaccine_status_planned: "Planlandı",
    toast_vaccine_marked_done: "Tamamlandı olarak işaretlendi ✓",
    toast_vaccine_unmarked: "Yaklaşıyor olarak işaretlendi",
    vaccine_at_birth: "Doğumda",
    vaccine_age_month: (m)=>`${m}. Ay`,
    vaccine_planned_label: (date)=>`Planlanan: ${date}`,
    vaccine_done_label: (date)=>`Yapıldı: ${date}`,
    vaccine_undo: "Geri Al",
    weaning_reaction_good: "Sorun Yok, Sevdi", weaning_reaction_dislike: "Beğenmedi",
    weaning_reaction_mild: "Hafif Reaksiyon", weaning_reaction_avoid: "Kaçınılmalı / Alerji",
    weaning_log_title: "Bugün Neler Verildi?",
    weaning_food_placeholder: (def)=>`Örn. ${def}`,
    weaning_default_food_example: "Havuç Püresi",
    weaning_amount_placeholder: "Miktar (opsiyonel, ör. 2 tatlı kaşığı)",
    weaning_reaction_label: "Tepkisi nasıldı?",
    weaning_add_to_log: "Günlüğe Ekle",
    toast_weaning_added: "Ek gıda günlüğüne eklendi ✓",
    toast_save_failed: "Kaydedilemedi, tekrar deneyin",
    toast_entry_removed: "Kayıt silindi",
    weaning_watchlist_title: "Takip Edilmesi Gereken Besinler",
    weaning_watchlist_text: (foods)=>`${foods} için hafif reaksiyon/kaçınma notu var. Bu besinleri tekrar vermeden önce doktorunuza danışın.`,
    weaning_history_empty: "Henüz kayıt yok. Bugün verdiğin ilk besini ekle!",
    weaning_amount_label: (amt)=>`Miktar: ${amt}`,
    weaning_calendar_day: (d)=>`Ek Gıda · ${d}. Gün`,
    weaning_amount_recommend: (mult, gram)=>`Önerilen miktar: ${mult}x porsiyon (${gram})`,
    weaning_prep_title: "Nasıl Hazırlanır?",
    weaning_allergy_title: "Alerji Belirtileri",
    weaning_allergy_text: "Kızarıklık, döküntü, kusma veya huzursuzluk görülürse besini kesip doktorunuza danışın.",
    weaning_alt_title: "Alternatif Besin",
    weaning_avoid_title: "Verilmemesi Gerekenler",
    foodlog_error: "Yemek günlüğü yüklenemedi.",
    toast_meal_saved: "Öğün kaydedildi ✓",
    foodlog_title: "Bugün Ne Yedi?",
    foodlog_placeholder: "Örn. Somon balığı ve patates püresi",
    foodlog_note_placeholder: "Not ekle (opsiyonel, ör. az yedi / bayıldı)",
    foodlog_add_btn: "Yemek Listesine Ekle",
    foodlog_history_title: "Geçmiş Öğünler",
    foodlog_history_empty: "Henüz kayıt yok. İlk öğününü ekle!",
    foodlog_suggestions_title: "Yaşa Göre Beslenme Önerileri",
    age_group_1: "6-8 Ay", age_group_2: "9-11 Ay", age_group_3: "12+ Ay",
    teething_today_restless_title: "Bugün Huzursuz mu?",
    teething_today_restless_desc: "Cevabına göre önerileri sıralayalım",
    teething_yes_restless: "Evet, Huzursuz",
    teething_no_calm: "Hayır, Sakin",
    teething_last_log: (date,time,restless)=>`Son kayıt: ${date} · ${time} — ${restless?"Huzursuzdu":"Sakindi"}`,
    toast_teething_restless: "Huzursuzluk kaydedildi, öneriler güncellendi ✓",
    toast_teething_calm: "Bugün sakin olarak kaydedildi ✓",
    teething_priority_title: "Bugün İçin Öncelikli Öneriler",
    teething_calm_title: "Bebeğiniz Sakin — Genel Bilgi",
    teething_priority_text: "Bebeğiniz huzursuzsa önce soğuk ve doğal yöntemleri deneyin; ihtiyaç halinde eczacınıza danışarak jel desteğini değerlendirebilirsiniz.",
    teething_calm_text: "Şu an belirgin bir huzursuzluk yok; yine de diş etlerini günlük kontrol etmek ve doğal yöntemleri hazır bulundurmak faydalı olur.",
    teething_relief_methods_title: "Rahatlatıcı Yöntemler",
    teething_footer_note: "Ateş, aşırı ağlama, iştahsızlık veya ishal gibi belirtiler eşlik ediyorsa bunu diş çıkarmaya bağlamadan önce doktorunuza danışın.",
    poop_reason_sert_warn: (d)=>`${d} gündür sert/topak kaka görülüyor — bu kabızlık belirtisi olabilir. Bol sıvı, lifli meyve püreleri (erik, armut) ve karın masajı deneyebilirsiniz; 3 günü aşarsa doktorunuza danışın.`,
    poop_reason_sert_info: "Tek seferlik sertlik genelde geçicidir; su/sıvı alımını artırıp izlemeye devam edin.",
    poop_reason_sulu_warn: (d)=>`${d} gündür sulu/cıvık kaka ishal belirtisi olabilir. Sıvı kaybına karşı bol sıvı verin; ${d>=3?"vakit kaybetmeden doktorunuza başvurun.":"devam ederse doktorunuza danışın."}`,
    poop_reason_sulu_info: "Tek seferlik sulu kaka genelde zararsızdır, tekrarlarsa izlemeye devam edin.",
    poop_reason_yesil_warn: (d)=>`${d} gündür yeşilimsi kaka görülüyor; genelde beslenmeyle ilgilidir ama uzun sürüyorsa doktorunuza danışabilirsiniz.`,
    poop_reason_yesil_info: "Yeşilimsi renk çoğunlukla zararsızdır ve beslenmeyle ilişkilidir.",
    poop_reason_mukuslu: (d)=>`${d>1?`${d} gündür `:""}Mukuslu kaka sindirim sisteminde hafif tahriş belirtisi olabilir; ${d>=2?"devam ederse doktorunuza danışın.":"izlemeye devam edin."}`,
    poop_reason_kanli: "Kakada kan görülmesi ciddi olabilir; vakit kaybetmeden doktorunuza başvurun.",
    poop_reason_default: "Kıvam normal aralıkta görünüyor, takibe devam edin.",
    poop_save_title: "Kaka Kıvamını Kaydet",
    poop_days_question: "Kaç gündür bu kıvamda? (Örn. 2 gündür yumuşak kaka yapıyor)",
    toast_poop_saved: (label,days)=>`${label} · ${days} gündür kaydedildi ✓`,
    poop_reasons_title: "Bu Kayda Göre Olası Nedenler",
    constipation_tips_title: "Kabızlık İçin Genel Öneriler",
    poop_history_empty: "Henüz kayıt yok. İlk kaydını ekle!",
    poop_days_ago: (days)=>`${days} gündür`,
    poop_consult_doctor: "Doktora danışın",
    shopping_cart_title: "Sepetim",
    shopping_own_list_title: "Kendi Listeni Oluştur",
    shopping_placeholder: "Örn. Bebek maması",
    toast_list_added: "Liste eklendi ✓",
    shopping_my_list: (n)=>`Listem (${n})`,
    shopping_checked_count: (n)=>`${n} işaretli`,
    shopping_by_age_title: "Yaşa Göre Öneriler",
    place_no_address: "Adres bilgisi yok",
    place_directions: "Yol tarifi →",
    nearby_title: "Yakınımda",
    nearby_subtitle: "Konumuna göre en yakın eczaneler ve bebek mağazaları.",
    nearby_refresh_location: "Konumu Yenile",
    nearby_location_changed: "Konumunuz değişti, listeler yeni konumunuza göre güncellendi ✓",
    nearby_denied: "Konum izni verilmedi",
    nearby_unsupported: "Cihazın konumu desteklemiyor",
    nearby_error: "Konum alınamadı",
    nearby_idle_title: "Konumunu bul, en yakınları görelim",
    nearby_denied_desc: "Tarayıcı/telefon ayarlarından bu site için konum iznini açıp tekrar dene.",
    nearby_idle_desc: "Konumunu paylaşman en yakın eczane ve bebek mağazalarını harita üzerinde göstermemizi sağlar.",
    nearby_locating: "Konum alınıyor...",
    nearby_find_btn: "Konumumu Bul",
    toast_location_denied: "Konum izni reddedildi",
    toast_location_failed: "Konum alınamadı, tekrar deneyin",
    nearby_pharmacies: "Eczaneler",
    nearby_baby_stores: "Bebek Mağazaları",
    nearby_country: "Türkiye",
    nearby_local_area: "Yakın Çevre",
    nearby_location_found: "Konumun bulundu",
    nearby_duty_pharmacy_title: "Bugün Nöbetçi Eczaneler",
    nearby_duty_pharmacy_desc: (loc)=>`${loc} için güncel listeyi gör`,
    nearby_duty_pharmacy_desc_default: "İlin için güncel listeyi gör",
    nearby_closest_pharmacies: "En Yakın Eczaneler",
    nearby_searching_pharmacies: "Yakındaki eczaneler aranıyor...",
    nearby_pharmacy_load_error: "Eczaneler yüklenirken bağlantı sorunu oluştu.",
    nearby_retry: "Tekrar Dene",
    nearby_no_pharmacies: "Yakında kayıtlı eczane bulunamadı.",
    nearby_closest_baby_stores: "En Yakın Bebek Mağazaları",
    nearby_searching_baby_stores: "Yakındaki bebek mağazaları aranıyor...",
    nearby_baby_store_load_error: "Bebek mağazaları yüklenirken bağlantı sorunu oluştu.",
    nearby_no_baby_stores: "Yakında kayıtlı bebek mağazası bulunamadı.",
    nearby_search_google_maps: "Google Haritalar'da ara →",
    activities_title: "Etkinlikler",
    activities_section_daily: "Günlük Aktivite", activities_section_craft: "El İşi", activities_section_story: "Hikayeler",
    activities_section_lullaby: "Ninniler", activities_section_sound: "Uyku Sesleri", activities_section_diet: "Anne Diyeti",
    activities_section_health: "Anne Sağlığı", activities_section_shopping: "Alışveriş Listesi", activities_section_memory: "Anı Günlüğü", activities_section_badge: "Rozetler",
    age_all: "Tümü",
    activities_skill_label: (skill)=>`Geliştirdiği beceri: ${skill}`,
    craft_how_to: "Nasıl yapılır?",
    craft_materials_title: "Gerekli Malzemeler",
    craft_steps_title: "Adım Adım Yapılışı",
    craft_dev_tip_title: "Gelişim İpucu",
    story_listen_note: "Tarayıcının sesli okuma özelliğiyle gerçekten dinlenebilir.",
    story_reading_now: " · Okunuyor...",
    lullaby_listen_note: "Sözlerini yumuşak bir sesle dinleyebilirsiniz.",
    lullaby_playing_now: " · Dinleniyor...",
    sound_now_playing: (name)=>`${name} çalıyor`,
    timer_15: "15 dk", timer_30: "30 dk", timer_60: "1 saat", timer_inf: "Sonsuz",
    age_filter_0_6: "0-6 ay", age_filter_6_12: "6-12 ay", age_filter_12_24: "12-24 ay", age_filter_2_3y: "2-3 yaş", age_filter_3plus: "3+ yaş",
    community_title: "Anne Sohbeti",
    community_intro: "Diğer annelerle sohbet edebileceğiniz paylaşımlı bir alan. Burada yazdıklarınızı bu uygulamayı kullanan herkes görebilir — lütfen kişisel bilgilerinizi (telefon, adres vb.) paylaşmayın.",
    community_pick_nickname: "Önce bir takma ad seçin",
    community_nickname_placeholder: "Örn. Ayşe Anne",
    community_join_btn: "Sohbete Katıl",
    toast_nickname_saved: "Takma adınız kaydedildi ✓",
    community_writing_as: (name)=>`${name} olarak yazıyorsunuz · herkese açık paylaşımlı alan`,
    community_no_messages: "Henüz mesaj yok. İlk mesajı sen yaz!",
    community_clear_confirm: "Tüm topluluk mesajlarını kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.",
    toast_community_cleared: "Tüm mesajlar silindi ✓",
    community_message_placeholder: "Bir mesaj yaz...",
    toast_message_send_failed: "Mesaj gönderilemedi, tekrar deneyin",
    assistant_title: "Yapay Zeka Anne Asistanı",
    assistant_disclaimer: "Sadece bilgilendirme amaçlıdır, tanı koymaz.",
    assistant_unlimited_badge: "Sınırsız (Premium)",
    assistant_usage_badge: (left,total)=>`Bugün ${left}/${total} mesaj hakkın kaldı`,
    assistant_input_placeholder: "Bir şey sorun...",
    assistant_history_title: "Geçmiş Sohbetler",
    assistant_no_chats: "Henüz sohbet yok.",
    assistant_message_count: (n)=>`${n} mesaj`,
    assistant_fallback_reply: "Şu anda yanıt üretemedim, tekrar dener misiniz?",
    assistant_error: "Yanıt alınamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    toast_assistant_failed: "Asistan yanıt veremedi",
    new_chat: "Yeni Sohbet",
    assistant_greeting: "Merhaba! Ben Anne Asistanınız 🤍 Hamilelik, bebek bakımı veya gelişimle ilgili merak ettiklerinizi sorabilirsiniz. Acil durumlarda lütfen doktorunuza başvurun.",
    // Regl Takvimi
    regl_title: "Regl Takvimi",
    regl_subtitle: "Döngünü takip et, bir sonraki regl ve doğurgan günlerini gör.",
    regl_day_of_cycle: (n)=>`Döngünün ${n}. günü`,
    regl_active_period: "Regl devam ediyor",
    regl_next_period_today: "Regl'in bugün başlaması bekleniyor",
    regl_next_period_tomorrow: "Regl'in yarın başlaması bekleniyor",
    regl_next_period_in: (n)=>`Regl'e ${n} gün`,
    regl_next_period_late: (n)=>`Tahmini tarihten ${n} gün geçti`,
    regl_next_period_unknown: "Tahmin için bir regl başlangıcı ekle",
    regl_start_btn: "Regl Başladı",
    regl_end_btn: "Regl Bitti",
    regl_cycle_length_label: (n)=>`Ort. döngü: ${n} gün`,
    regl_period_length_label: (n)=>`Ort. süre: ${n} gün`,
    regl_legend_period: "Regl",
    regl_legend_predicted: "Tahmini Regl",
    regl_legend_fertile: "Doğurgan Dönem",
    regl_legend_ovulation: "Yumurtlama",
    regl_history_title: "Geçmiş Döngüler",
    regl_history_empty: "Henüz kayıt yok. İlk regl kaydını ekle!",
    regl_cycle_render: (start,end,len)=>`${start} – ${end || "devam ediyor"}${len?` · ${len} gün sürdü`:""}`,
    regl_settings_title: "Döngü Ayarları",
    regl_settings_btn: "Döngü Ayarları",
    regl_avg_cycle_label: "Ortalama döngü uzunluğu (gün)",
    regl_avg_period_label: "Ortalama regl süresi (gün)",
    regl_settings_save: "Kaydet",
    regl_settings_desc: "Geçmiş kayıtların arttıkça tahminler otomatik olarak daha isabetli hale gelir; bu değerler henüz yeterli geçmiş yokken ilk tahminler için kullanılır.",
    regl_delete_confirm: "Bu döngü kaydını silmek istediğine emin misin?",
    toast_regl_started: "Regl başlangıcı kaydedildi ✓",
    toast_regl_ended: "Regl bitişi kaydedildi ✓",
    toast_regl_settings_saved: "Ayarlar kaydedildi ✓",
  },
};

const LanguageContext = createContext({ lang: "tr", t: (k)=>k });
function useLang() { return useContext(LanguageContext); }

function LanguageProvider({ children }) {
  const t = (key, ...args) => {
    const entry = UI_TEXT.tr[key];
    if (entry === undefined) return key;
    return typeof entry === "function" ? entry(...args) : entry;
  };

  return (
    <LanguageContext.Provider value={{lang:"tr", t}}>
      {children}
    </LanguageContext.Provider>
  );
}

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

const VACCINE_NAMES_TR = [
  "Hepatit B (1. doz)", "BCG (Verem Aşısı)", "6'lı Karma — DaBT-İPA-Hib-Hepatit B (1. doz)",
  "KPA — Konjuge Pnömokok Aşısı (1. doz)", "6'lı Karma (2. doz)", "KPA (2. doz)",
  "6'lı Karma (3. doz)", "OPA — Ağızdan Çocuk Felci Aşısı (1. doz)", "KPA Rapel (3. doz)",
  "KKK — Kızamık-Kızamıkçık-Kabakulak (1. doz)", "Suçiçeği (1. doz)", "DaBT-İPA-Hib Rapel",
  "OPA (2. doz)", "KKK (2. doz)", "Hepatit A (1. doz)", "Hepatit A (2. doz)",
  "DaBT-İPA Rapel (4-6 yaş)", "Td — Tetanoz-Difteri (İlkokul 1. Sınıf, yaklaşık 6-7 yaş)"
];
const VACCINE_NAMES_EN = [
  "Hepatitis B (dose 1)", "BCG (Tuberculosis vaccine)", "6-in-1 — DTaP-IPV-Hib-HepB (dose 1)",
  "PCV — Pneumococcal Conjugate Vaccine (dose 1)", "6-in-1 (dose 2)", "PCV (dose 2)",
  "6-in-1 (dose 3)", "OPV — Oral Polio Vaccine (dose 1)", "PCV Booster (dose 3)",
  "MMR — Measles-Mumps-Rubella (dose 1)", "Varicella (dose 1)", "DTaP-IPV-Hib Booster",
  "OPV (dose 2)", "MMR (dose 2)", "Hepatitis A (dose 1)", "Hepatitis A (dose 2)",
  "DTaP-IPV Booster (age 4-6)", "Td — Tetanus-Diphtheria (1st grade, around age 6-7)"
];
const VACCINE_NAMES_DE = [
  "Hepatitis B (1. Dosis)", "BCG (Tuberkulose-Impfung)", "6-fach-Impfung — DTaP-IPV-Hib-HepB (1. Dosis)",
  "PCV — Pneumokokken-Konjugatimpfstoff (1. Dosis)", "6-fach-Impfung (2. Dosis)", "PCV (2. Dosis)",
  "6-fach-Impfung (3. Dosis)", "OPV — Orale Kinderlähmungsimpfung (1. Dosis)", "PCV-Auffrischung (3. Dosis)",
  "MMR — Masern-Mumps-Röteln (1. Dosis)", "Windpocken (1. Dosis)", "DTaP-IPV-Hib-Auffrischung",
  "OPV (2. Dosis)", "MMR (2. Dosis)", "Hepatitis A (1. Dosis)", "Hepatitis A (2. Dosis)",
  "DTaP-IPV-Auffrischung (4-6 Jahre)", "Td — Tetanus-Diphtherie (1. Klasse, ca. 6-7 Jahre)"
];
const VACCINE_AGE_MONTHS = [0,2,2,2,4,4,6,6,12,12,12,18,18,18,18,24,48,78];
const VACCINE_NAMES_BY_LANG = { tr: VACCINE_NAMES_TR, en: VACCINE_NAMES_EN, de: VACCINE_NAMES_DE };
function getVaccineSchedule(lang) {
  const names = VACCINE_NAMES_BY_LANG[lang] || VACCINE_NAMES_TR;
  return VACCINE_AGE_MONTHS.map((ageMonths,i)=>({ageMonths, name: names[i]}));
}
const VACCINE_SCHEDULE = getVaccineSchedule("tr");
// Geriye dönük uyumluluk için eski isim
const VACCINES = VACCINE_SCHEDULE.map(v=>({age: v.ageMonths===0?"Doğumda":`${v.ageMonths}. Ay`, name:v.name}));


const WEANING_FOODS_TR = [
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
const WEANING_FOODS_EN = [
  {name:"Apple Puree", gram:"1-2 teaspoons", prep:"Peel and steam the apple, then mash well.", alt:"Pear puree", allergy:"Rare, may cause gas."},
  {name:"Mashed Banana", gram:"2-3 teaspoons", prep:"Mash a ripe banana with a fork, no cooking needed.", alt:"Mashed avocado", allergy:"Low risk."},
  {name:"Carrot Puree", gram:"1-2 teaspoons", prep:"Steam until soft, then mash.", alt:"Pumpkin puree", allergy:"Low risk."},
  {name:"Baby Rice Cereal", gram:"1-2 tablespoons, thinned", prep:"Mix with breast milk/formula until smooth.", alt:"Oat cereal", allergy:"Gluten-free, low risk."},
  {name:"Sweet Potato Puree", gram:"1-2 teaspoons", prep:"Bake or steam, then mash.", alt:"Squash puree", allergy:"Low risk."},
  {name:"Mashed Avocado", gram:"1-2 teaspoons", prep:"Mash a ripe avocado with a fork.", alt:"Mashed banana", allergy:"Low risk."},
  {name:"Pear Puree", gram:"1-2 teaspoons", prep:"Steam and mash.", alt:"Apple puree", allergy:"Low risk."},
  {name:"Zucchini Puree", gram:"1-2 teaspoons", prep:"Steam and mash.", alt:"Carrot puree", allergy:"Low risk."},
  {name:"Broccoli Puree", gram:"1 teaspoon", prep:"Steam until soft, mash/strain well.", alt:"Cauliflower puree", allergy:"May cause gas, introduce gradually."},
  {name:"Oatmeal", gram:"1-2 tablespoons", prep:"Cook finely ground oats with milk/water.", alt:"Rice cereal", allergy:"Low risk."},
  {name:"Mixed Vegetable Puree", gram:"2-3 teaspoons", prep:"Boil carrot, zucchini and potato together, then mash.", alt:"Single-vegetable puree", allergy:"Introduce each new vegetable one at a time."},
  {name:"Lentil Puree (fine)", gram:"1-2 teaspoons", prep:"Cook red lentils thoroughly, strain and mash.", alt:"Chickpea puree (later months)", allergy:"First legume trial, introduce gradually."},
  {name:"Peach Puree", gram:"1-2 teaspoons", prep:"Peel, steam and mash.", alt:"Apricot puree", allergy:"Low risk."},
  {name:"Spinach Mix", gram:"1 teaspoon", prep:"Boil briefly and mix with another vegetable.", alt:"Can be mixed with zucchini", allergy:"Give in small amounts due to nitrate content."}
];
const WEANING_FOODS_DE = [
  {name:"Apfelmus", gram:"1-2 Teelöffel", prep:"Apfel schälen, dünsten und gut pürieren.", alt:"Birnenmus", allergy:"Selten, kann Blähungen verursachen."},
  {name:"Bananenmus", gram:"2-3 Teelöffel", prep:"Reife Banane mit einer Gabel zerdrücken, kein Kochen nötig.", alt:"Avocadomus", allergy:"Geringes Risiko."},
  {name:"Karottenpüree", gram:"1-2 Teelöffel", prep:"Dünsten, bis weich, dann pürieren.", alt:"Kürbispüree", allergy:"Geringes Risiko."},
  {name:"Baby-Reisbrei", gram:"1-2 Esslöffel, verdünnt", prep:"Mit Muttermilch/Fläschchen glatt rühren.", alt:"Haferbrei", allergy:"Glutenfrei, geringes Risiko."},
  {name:"Süßkartoffelpüree", gram:"1-2 Teelöffel", prep:"Backen/dünsten, dann pürieren.", alt:"Kürbispüree", allergy:"Geringes Risiko."},
  {name:"Avocadomus", gram:"1-2 Teelöffel", prep:"Reife Avocado mit einer Gabel zerdrücken.", alt:"Bananenmus", allergy:"Geringes Risiko."},
  {name:"Birnenmus", gram:"1-2 Teelöffel", prep:"Dünsten und pürieren.", alt:"Apfelmus", allergy:"Geringes Risiko."},
  {name:"Zucchinipüree", gram:"1-2 Teelöffel", prep:"Dünsten und pürieren.", alt:"Karottenpüree", allergy:"Geringes Risiko."},
  {name:"Brokkolipüree", gram:"1 Teelöffel", prep:"Dünsten bis weich, gut pürieren/passieren.", alt:"Blumenkohlpüree", allergy:"Kann Blähungen verursachen, langsam einführen."},
  {name:"Haferbrei", gram:"1-2 Esslöffel", prep:"Fein gemahlenen Hafer mit Milch/Wasser kochen.", alt:"Reisbrei", allergy:"Geringes Risiko."},
  {name:"Gemüsepüree gemischt", gram:"2-3 Teelöffel", prep:"Karotte, Zucchini und Kartoffel zusammen kochen und pürieren.", alt:"Einzelnes Gemüsepüree", allergy:"Jedes neue Gemüse einzeln einführen."},
  {name:"Linsenpüree (fein)", gram:"1-2 Teelöffel", prep:"Rote Linsen gut kochen, passieren und pürieren.", alt:"Kichererbsenpüree (später)", allergy:"Erster Hülsenfrucht-Versuch, langsam einführen."},
  {name:"Pfirsichpüree", gram:"1-2 Teelöffel", prep:"Schälen, dünsten und pürieren.", alt:"Aprikosenpüree", allergy:"Geringes Risiko."},
  {name:"Spinat-Mix", gram:"1 Teelöffel", prep:"Kurz kochen und mit einem anderen Gemüse mischen.", alt:"Kann mit Zucchini gemischt werden", allergy:"Wegen Nitratgehalt nur in kleinen Mengen geben."}
];
const WEANING_FOODS_BY_LANG = { tr: WEANING_FOODS_TR, en: WEANING_FOODS_EN, de: WEANING_FOODS_DE };
function getWeaningFoods(lang) { return WEANING_FOODS_BY_LANG[lang] || WEANING_FOODS_TR; }
const WEANING_FOODS = WEANING_FOODS_TR;
const AVOID_FOODS_TR = ["Bal (1 yaş altı botulizm riski)","Tuz ve şeker eklenmiş yiyecekler","İnek sütü (1 yaş altı ana içecek olarak)","Bütün fındık/fıstık (boğulma riski)","İşlenmiş/paketli gıdalar","Az pişmiş yumurta ve et"];
const AVOID_FOODS_EN = ["Honey (botulism risk under age 1)","Foods with added salt and sugar","Cow's milk (as a main drink under age 1)","Whole nuts/peanuts (choking hazard)","Processed/packaged foods","Undercooked eggs and meat"];
const AVOID_FOODS_DE = ["Honig (Botulismus-Risiko unter 1 Jahr)","Lebensmittel mit zugesetztem Salz und Zucker","Kuhmilch (als Hauptgetränk unter 1 Jahr)","Ganze Nüsse/Erdnüsse (Erstickungsgefahr)","Verarbeitete/verpackte Lebensmittel","Nicht durchgegarte Eier und Fleisch"];
const AVOID_FOODS_BY_LANG = { tr: AVOID_FOODS_TR, en: AVOID_FOODS_EN, de: AVOID_FOODS_DE };
function getAvoidFoods(lang) { return AVOID_FOODS_BY_LANG[lang] || AVOID_FOODS_TR; }
const AVOID_FOODS = AVOID_FOODS_TR;


/* ============================================================
   BESLENME GÜNLÜĞÜ ÖNERİLERİ — yaşa göre örnek, dengeli besin
   kombinasyonları. Anneler kendi verdikleri yemekleri de serbestçe
   kaydedebilir; bu liste sadece fikir vermesi için bir öneri havuzudur.
   ============================================================ */
const FOOD_COMBO_SUGGESTIONS_TR = [
  {age:"a1", combo:"Somon Balığı ve Patates Püresi", tag:"Balık", detail:"Omega-3 ve demir açısından zengindir; haşlanmış patatesle ezilerek pürüzsüz kıvamda verilebilir."},
  {age:"a1", combo:"Tatlı Patates ve Nohut Püresi", tag:"Baklagil", detail:"Lif ve B vitamini kaynağıdır, kabızlığı önlemeye yardımcı olabilir."},
  {age:"a1", combo:"Avokado ve Muz Ezmesi", tag:"Meyve", detail:"Sağlıklı yağlar ve enerji sağlar, pişirmeye gerek yoktur."},
  {age:"a1", combo:"Karışık Sebze ve Zeytinyağı Püresi", tag:"Sebze", detail:"Havuç, kabak ve patatesi birlikte haşlayıp az zeytinyağıyla ezin."},
  {age:"a2", combo:"Tavuklu Sebze Yemeği (Ezilmiş)", tag:"Et/Tavuk", detail:"Protein ve demir kaynağıdır; sebzelerle birlikte hafif ezilmiş kıvamda sunulabilir."},
  {age:"a2", combo:"Kırmızı Mercimek Çorbası ve Yoğurt", tag:"Baklagil", detail:"Bitkisel protein ve probiyotik desteği bir arada verilir."},
  {age:"a2", combo:"Yumurta Sarısı ve Ekmek Parçaları", tag:"Yumurta", detail:"İyi pişmiş yumurta sarısı demir ve kolin açısından zengindir."},
  {age:"a2", combo:"Balık (Levrek/Somon) ve Pirinç Pilavı", tag:"Balık", detail:"Küçük parçalar halinde, kılçıksız ve iyi pişmiş şekilde sunulmalıdır."},
  {age:"a3", combo:"Köfte ve Haşlanmış Sebzeler", tag:"Et", detail:"Küçük lokmalar halinde verilerek çiğneme becerisi desteklenir."},
  {age:"a3", combo:"Tam Tahıllı Makarna ve Ispanaklı Sos", tag:"Tahıl", detail:"Kompleks karbonhidrat ve demir bir arada sunulur."},
  {age:"a3", combo:"Nohutlu Sebze Yemeği ve Yoğurt", tag:"Baklagil", detail:"Lif, protein ve kalsiyum dengesi sağlar."},
  {age:"a3", combo:"Izgara Tavuk ve Bulgur Pilavı", tag:"Et/Tavuk", detail:"Aile sofrasına geçişte tuzsuz/az baharatlı hazırlanabilir."}
];
const FOOD_COMBO_SUGGESTIONS_EN = [
  {age:"a1", combo:"Salmon and Mashed Potatoes", tag:"Fish", detail:"Rich in omega-3 and iron; can be served mashed with boiled potatoes for a smooth texture."},
  {age:"a1", combo:"Sweet Potato and Chickpea Puree", tag:"Legume", detail:"A source of fiber and B vitamins; may help prevent constipation."},
  {age:"a1", combo:"Avocado and Banana Mash", tag:"Fruit", detail:"Provides healthy fats and energy, no cooking required."},
  {age:"a1", combo:"Mixed Vegetable and Olive Oil Puree", tag:"Vegetable", detail:"Boil carrot, zucchini and potato together and mash with a little olive oil."},
  {age:"a2", combo:"Chicken and Vegetable Meal (Mashed)", tag:"Meat/Chicken", detail:"A source of protein and iron; can be served lightly mashed with vegetables."},
  {age:"a2", combo:"Red Lentil Soup and Yogurt", tag:"Legume", detail:"Combines plant protein with probiotic support."},
  {age:"a2", combo:"Egg Yolk and Bread Pieces", tag:"Egg", detail:"Well-cooked egg yolk is rich in iron and choline."},
  {age:"a2", combo:"Fish (Sea Bass/Salmon) and Rice Pilaf", tag:"Fish", detail:"Should be served in small pieces, boneless and well cooked."},
  {age:"a3", combo:"Meatballs and Boiled Vegetables", tag:"Meat", detail:"Served in small bites to support chewing skills."},
  {age:"a3", combo:"Whole Grain Pasta with Spinach Sauce", tag:"Grain", detail:"Combines complex carbohydrates with iron."},
  {age:"a3", combo:"Chickpea Vegetable Stew and Yogurt", tag:"Legume", detail:"Provides a balance of fiber, protein and calcium."},
  {age:"a3", combo:"Grilled Chicken and Bulgur Pilaf", tag:"Meat/Chicken", detail:"Can be prepared unsalted/lightly seasoned when transitioning to family meals."}
];
const FOOD_COMBO_SUGGESTIONS_DE = [
  {age:"a1", combo:"Lachs und Kartoffelpüree", tag:"Fisch", detail:"Reich an Omega-3 und Eisen; kann mit gekochten Kartoffeln zu einer glatten Konsistenz püriert serviert werden."},
  {age:"a1", combo:"Süßkartoffel- und Kichererbsenpüree", tag:"Hülsenfrucht", detail:"Eine Quelle für Ballaststoffe und B-Vitamine; kann helfen, Verstopfung vorzubeugen."},
  {age:"a1", combo:"Avocado- und Bananenmus", tag:"Obst", detail:"Liefert gesunde Fette und Energie, kein Kochen nötig."},
  {age:"a1", combo:"Gemischtes Gemüse- und Olivenölpüree", tag:"Gemüse", detail:"Karotte, Zucchini und Kartoffel zusammen kochen und mit etwas Olivenöl pürieren."},
  {age:"a2", combo:"Hühnchen-Gemüse-Gericht (Püriert)", tag:"Fleisch/Huhn", detail:"Eine Quelle für Protein und Eisen; kann leicht püriert mit Gemüse serviert werden."},
  {age:"a2", combo:"Rote-Linsen-Suppe und Joghurt", tag:"Hülsenfrucht", detail:"Kombiniert pflanzliches Protein mit probiotischer Unterstützung."},
  {age:"a2", combo:"Eigelb und Brotstückchen", tag:"Ei", detail:"Gut durchgekochtes Eigelb ist reich an Eisen und Cholin."},
  {age:"a2", combo:"Fisch (Wolfsbarsch/Lachs) und Reispilaw", tag:"Fisch", detail:"Sollte in kleinen Stücken, ohne Gräten und gut durchgekocht serviert werden."},
  {age:"a3", combo:"Fleischbällchen und gekochtes Gemüse", tag:"Fleisch", detail:"In kleinen Häppchen serviert, um die Kaufähigkeit zu fördern."},
  {age:"a3", combo:"Vollkornnudeln mit Spinatsauce", tag:"Getreide", detail:"Kombiniert komplexe Kohlenhydrate mit Eisen."},
  {age:"a3", combo:"Kichererbsen-Gemüse-Eintopf und Joghurt", tag:"Hülsenfrucht", detail:"Bietet eine Balance aus Ballaststoffen, Protein und Kalzium."},
  {age:"a3", combo:"Gegrilltes Hühnchen und Bulgurpilaw", tag:"Fleisch/Huhn", detail:"Kann beim Übergang zu Familienmahlzeiten ungesalzen/leicht gewürzt zubereitet werden."}
];
const FOOD_COMBO_BY_LANG = { tr: FOOD_COMBO_SUGGESTIONS_TR, en: FOOD_COMBO_SUGGESTIONS_EN, de: FOOD_COMBO_SUGGESTIONS_DE };
function getFoodComboSuggestions(lang) { return FOOD_COMBO_BY_LANG[lang] || FOOD_COMBO_SUGGESTIONS_TR; }
const FOOD_COMBO_SUGGESTIONS = FOOD_COMBO_SUGGESTIONS_TR;

/* ============================================================
   DİŞ ÇIKARMA — rahatlatıcı yöntemler ve neden işe yaradıkları.
   Bilgiler genel kaynaklardan derlenmiştir; ilaç/jel içeren ürünler
   için mutlaka doktor/eczacıya danışılması gerektiği belirtilir.
   ============================================================ */
const TEETHING_RELIEF_ITEMS_TR = [
  {key:"teether", name:"Soğuk Diş Kaşıyıcı (Teether)", type:"Doğal Yöntem", icon:Smile, color:"blue",
    why:"Buzdolabında soğutulmuş (dondurucuda değil) silikon kaşıyıcılar, diş etindeki sinir uçlarını geçici olarak hissizleştirir ve şişliği azaltır; bebeğin çiğneme ihtiyacını güvenle karşılar.",
    note:"Dondurucuda bekletmeyin — aşırı sertleşen kaşıyıcı diş etine zarar verebilir."},
  {key:"gauze", name:"Soğuk, Nemli Gazlı Bez", type:"Doğal Yöntem", icon:Droplet, color:"blue",
    why:"Temiz bir bezi soğuk suyla ıslatıp hafifçe diş etine sürmek hem soğuk etkisiyle rahatlatır hem de hafif masaj basıncıyla kaşıntı hissini azaltır.",
    note:"Her kullanımdan önce ve sonra bezi temiz tutun."},
  {key:"massage", name:"Parmakla Diş Eti Masajı", type:"Doğal Yöntem", icon:Heart, color:"pink",
    why:"Temiz parmakla nazikçe uygulanan baskı, diş etindeki basınç hissini dengeleyerek ağrı algısını azaltabilir.",
    note:"Ellerinizi mutlaka yıkayın ve tırnaklarınızın kısa olduğundan emin olun."},
  {key:"fruitnet", name:"Soğutulmuş Meyve Filesi", type:"Doğal Yöntem", icon:Utensils, color:"green",
    why:"Ek gıdaya başlamış bebeklerde file içine konan soğuk meyve (armut, muz gibi) hem soğuk rahatlığı sağlar hem de boğulma riski olmadan çiğneme pratiği yaptırır.",
    note:"Sadece 6 ay ve üzeri, ek gıdaya başlamış bebeklerde kullanılmalıdır."},
  {key:"calgel", name:"Calgel Diş Jeli", type:"Eczane Ürünü", icon:Pill, color:"purple",
    why:"İçeriğindeki lidokain hidroklorür diş etindeki sinir uçlarını geçici olarak uyuşturarak ağrıyı hafifletir; setilpiridinyum klorür ise antiseptik etkiyle bölgeyi mikroplara karşı korur.",
    note:"3 aydan küçük bebeklerde kullanılmaz. Kullanmadan önce mutlaka eczacınıza/doktorunuza danışın ve ambalajdaki doz talimatına uyun."},
  {key:"dentinox", name:"Dentinox Diş Jeli", type:"Eczane Ürünü", icon:Pill, color:"purple",
    why:"Lidokain hidroklorür ile birlikte papatya (kamomil) tentürü içerir; lidokain bölgesel uyuşma sağlarken papatya diş etindeki hafif tahrişi yatıştırıcı etki gösterir.",
    note:"Kullanmadan önce doktorunuza/eczacınıza danışın, ambalajdaki doz talimatına uyun."},
  {key:"amber", name:"Kehribar Kolye", type:"Önerilmez", icon:AlertCircle, color:"pink", warn:true,
    why:"Isıyla 'ağrı kesici madde' salındığı iddiası bilimsel olarak kanıtlanmamıştır; etkisi kanıtlanmış bir yöntem değildir.",
    note:"Boğulma ve boğazına dolanma riski nedeniyle başta FDA olmak üzere birçok sağlık otoritesi bebeklerde kullanılmamasını önerir."}
];
const TEETHING_RELIEF_ITEMS_EN = [
  {key:"teether", name:"Cold Teether", type:"Natural Method", icon:Smile, color:"blue",
    why:"Silicone teethers cooled in the fridge (not the freezer) temporarily numb the nerve endings in the gums and reduce swelling, safely satisfying the baby's need to chew.",
    note:"Don't leave it in the freezer — an overly hardened teether can harm the gums."},
  {key:"gauze", name:"Cold, Damp Gauze", type:"Natural Method", icon:Droplet, color:"blue",
    why:"Wetting a clean cloth with cold water and gently rubbing it on the gums soothes with the cold effect and reduces the itchy feeling with light massage pressure.",
    note:"Keep the cloth clean before and after each use."},
  {key:"massage", name:"Finger Gum Massage", type:"Natural Method", icon:Heart, color:"pink",
    why:"Gentle pressure applied with a clean finger can balance the pressure sensation in the gums and reduce the perception of pain.",
    note:"Always wash your hands and make sure your nails are short."},
  {key:"fruitnet", name:"Chilled Fruit Feeder Net", type:"Natural Method", icon:Utensils, color:"green",
    why:"For babies who have started solids, cold fruit (like pear or banana) placed in a feeder net provides cold relief and lets baby practice chewing without a choking risk.",
    note:"Should only be used for babies 6 months and older who have started solids."},
  {key:"calgel", name:"Calgel Teething Gel", type:"Pharmacy Product", icon:Pill, color:"purple",
    why:"The lidocaine hydrochloride it contains temporarily numbs the nerve endings in the gums to relieve pain; cetylpyridinium chloride protects the area from germs with an antiseptic effect.",
    note:"Not for use in babies under 3 months. Always consult your pharmacist/doctor before use and follow the dosage instructions on the package."},
  {key:"dentinox", name:"Dentinox Teething Gel", type:"Pharmacy Product", icon:Pill, color:"purple",
    why:"Contains lidocaine hydrochloride along with chamomile tincture; lidocaine provides local numbing while chamomile soothes mild irritation in the gums.",
    note:"Consult your doctor/pharmacist before use and follow the dosage instructions on the package."},
  {key:"amber", name:"Amber Necklace", type:"Not Recommended", icon:AlertCircle, color:"pink", warn:true,
    why:"The claim that a 'pain-relieving substance' is released by body heat has not been scientifically proven; it is not a method with proven effectiveness.",
    note:"Due to the risk of choking and strangulation, many health authorities, including the FDA, recommend against using it on babies."}
];
const TEETHING_RELIEF_ITEMS_DE = [
  {key:"teether", name:"Kalter Beißring", type:"Natürliche Methode", icon:Smile, color:"blue",
    why:"Im Kühlschrank (nicht im Gefrierfach) gekühlte Silikon-Beißringe betäuben vorübergehend die Nervenenden im Zahnfleisch und lindern Schwellungen; sie stillen sicher das Kaubedürfnis des Babys.",
    note:"Nicht im Gefrierfach aufbewahren — ein zu hart gewordener Beißring kann das Zahnfleisch verletzen."},
  {key:"gauze", name:"Kalte, feuchte Mullbinde", type:"Natürliche Methode", icon:Droplet, color:"blue",
    why:"Ein sauberes Tuch mit kaltem Wasser befeuchten und sanft über das Zahnfleisch reiben, lindert durch die Kälte und reduziert das Juckgefühl durch leichten Massagedruck.",
    note:"Halten Sie das Tuch vor und nach jeder Verwendung sauber."},
  {key:"massage", name:"Zahnfleischmassage mit dem Finger", type:"Natürliche Methode", icon:Heart, color:"pink",
    why:"Sanfter Druck mit einem sauberen Finger kann das Druckgefühl im Zahnfleisch ausgleichen und die Schmerzwahrnehmung verringern.",
    note:"Waschen Sie unbedingt Ihre Hände und achten Sie auf kurze Fingernägel."},
  {key:"fruitnet", name:"Gekühltes Obst im Beißnetz", type:"Natürliche Methode", icon:Utensils, color:"green",
    why:"Bei Babys, die bereits Beikost bekommen, sorgt kaltes Obst (z. B. Birne, Banane) im Beißnetz für Kälteentlastung und ermöglicht Kauübung ohne Erstickungsgefahr.",
    note:"Nur für Babys ab 6 Monaten, die bereits Beikost erhalten."},
  {key:"calgel", name:"Calgel Zahnungsgel", type:"Apothekenprodukt", icon:Pill, color:"purple",
    why:"Das enthaltene Lidocainhydrochlorid betäubt die Nervenenden im Zahnfleisch vorübergehend und lindert den Schmerz; Cetylpyridiniumchlorid schützt den Bereich antiseptisch vor Keimen.",
    note:"Nicht für Babys unter 3 Monaten. Konsultieren Sie vor der Anwendung unbedingt Ihren Apotheker/Arzt und befolgen Sie die Dosierungsanleitung auf der Packung."},
  {key:"dentinox", name:"Dentinox Zahnungsgel", type:"Apothekenprodukt", icon:Pill, color:"purple",
    why:"Enthält Lidocainhydrochlorid zusammen mit Kamillentinktur; Lidocain sorgt für lokale Betäubung, während Kamille leichte Reizungen im Zahnfleisch lindert.",
    note:"Konsultieren Sie vor der Anwendung Ihren Arzt/Apotheker und befolgen Sie die Dosierungsanleitung auf der Packung."},
  {key:"amber", name:"Bernsteinkette", type:"Nicht empfohlen", icon:AlertCircle, color:"pink", warn:true,
    why:"Die Behauptung, dass durch Körperwärme ein 'schmerzlinderndes Mittel' freigesetzt wird, ist wissenschaftlich nicht belegt; es handelt sich nicht um eine Methode mit nachgewiesener Wirkung.",
    note:"Aufgrund des Erstickungs- und Strangulationsrisikos raten viele Gesundheitsbehörden, darunter die FDA, von der Verwendung bei Babys ab."}
];
const TEETHING_RELIEF_BY_LANG = { tr: TEETHING_RELIEF_ITEMS_TR, en: TEETHING_RELIEF_ITEMS_EN, de: TEETHING_RELIEF_ITEMS_DE };
function getTeethingReliefItems(lang) { return TEETHING_RELIEF_BY_LANG[lang] || TEETHING_RELIEF_ITEMS_TR; }
const TEETHING_RELIEF_ITEMS = TEETHING_RELIEF_ITEMS_TR;

/* Bugün huzursuz mu? cevabına göre önceliklendirilmiş öneri sırası (anahtar bazlı) */
const TEETHING_RESTLESS_TIP_ORDER = ["teether","gauze","massage","fruitnet","calgel","dentinox"];
const TEETHING_CALM_TIP_ORDER = ["massage","teether","fruitnet"];


/* ============================================================
   KAKA TAKİBİ — kıvam türleri ve kabızlık için genel öneriler
   ============================================================ */
const STOOL_TYPES_TR = [
  {key:"sert", label:"Sert / Topak", color:"pink", flag:"Kabızlık belirtisi olabilir", urgent:false},
  {key:"normal", label:"Normal / Şekilli", color:"green", flag:"Normal görünüyor", urgent:false},
  {key:"yumusak", label:"Yumuşak", color:"green", flag:"Normal görünüyor", urgent:false},
  {key:"sulu", label:"Sulu / Cıvık", color:"blue", flag:"Sık tekrarlarsa ishal olabilir, sıvı takibi yapın", urgent:false},
  {key:"yesil", label:"Yeşilimsi", color:"purple", flag:"Genelde zararsızdır, uzun sürerse doktora danışın", urgent:false},
  {key:"mukuslu", label:"Mukuslu", color:"purple", flag:"Sindirim sistemi tahrişi olabilir", urgent:false},
  {key:"kanli", label:"Kanlı", color:"pink", flag:"Vakit kaybetmeden doktorunuza başvurun", urgent:true}
];
const STOOL_TYPES_EN = [
  {key:"sert", label:"Hard / Pellet-like", color:"pink", flag:"May indicate constipation", urgent:false},
  {key:"normal", label:"Normal / Formed", color:"green", flag:"Looks normal", urgent:false},
  {key:"yumusak", label:"Soft", color:"green", flag:"Looks normal", urgent:false},
  {key:"sulu", label:"Watery / Runny", color:"blue", flag:"May be diarrhea if frequent, monitor fluids", urgent:false},
  {key:"yesil", label:"Greenish", color:"purple", flag:"Usually harmless, consult a doctor if it persists", urgent:false},
  {key:"mukuslu", label:"Mucousy", color:"purple", flag:"May indicate digestive irritation", urgent:false},
  {key:"kanli", label:"Bloody", color:"pink", flag:"See your doctor without delay", urgent:true}
];
const STOOL_TYPES_DE = [
  {key:"sert", label:"Hart / Klumpig", color:"pink", flag:"Kann auf Verstopfung hindeuten", urgent:false},
  {key:"normal", label:"Normal / Geformt", color:"green", flag:"Sieht normal aus", urgent:false},
  {key:"yumusak", label:"Weich", color:"green", flag:"Sieht normal aus", urgent:false},
  {key:"sulu", label:"Wässrig / Breiig", color:"blue", flag:"Bei häufigem Auftreten kann es Durchfall sein, Flüssigkeit beobachten", urgent:false},
  {key:"yesil", label:"Grünlich", color:"purple", flag:"Meist harmlos, bei längerem Andauern Arzt konsultieren", urgent:false},
  {key:"mukuslu", label:"Schleimig", color:"purple", flag:"Kann auf Reizung des Verdauungssystems hindeuten", urgent:false},
  {key:"kanli", label:"Blutig", color:"pink", flag:"Suchen Sie unverzüglich Ihren Arzt auf", urgent:true}
];
const STOOL_TYPES_BY_LANG = { tr: STOOL_TYPES_TR, en: STOOL_TYPES_EN, de: STOOL_TYPES_DE };
function getStoolTypes(lang) { return STOOL_TYPES_BY_LANG[lang] || STOOL_TYPES_TR; }
const STOOL_TYPES = STOOL_TYPES_TR;
const CONSTIPATION_TIPS_TR = [
  "6 aydan büyükse bebeğinizin günlük su alımını artırın.",
  "Erik, armut ve kayısı gibi lifli meyve püreleri bağırsak hareketini destekleyebilir.",
  "Bacaklarını bisiklet çevirir gibi nazikçe hareket ettirmek bağırsakları rahatlatabilir.",
  "Karnına, saat yönünde nazik bir masaj yapmak rahatlatıcı olabilir.",
  "Ilık bir banyo karın kaslarını gevşeterek rahatlamaya yardımcı olabilir.",
  "3 günden uzun süredir kakası gelmiyorsa, kakasında kan varsa veya şiddetli ağlama/karın şişliği görülüyorsa vakit kaybetmeden doktorunuza başvurun."
];
const CONSTIPATION_TIPS_EN = [
  "If your baby is older than 6 months, increase their daily water intake.",
  "Fibrous fruit purees like prune, pear and apricot can support bowel movement.",
  "Gently moving the legs in a bicycling motion can relax the bowels.",
  "A gentle clockwise massage on the belly can be soothing.",
  "A warm bath can help by relaxing the abdominal muscles.",
  "See your doctor without delay if there's been no stool for more than 3 days, if there's blood in the stool, or if there's severe crying/abdominal bloating."
];
const CONSTIPATION_TIPS_DE = [
  "Wenn Ihr Baby älter als 6 Monate ist, erhöhen Sie die tägliche Wasseraufnahme.",
  "Ballaststoffreiche Fruchtpürees wie Pflaume, Birne und Aprikose können die Darmbewegung unterstützen.",
  "Die Beine sanft wie beim Fahrradfahren zu bewegen kann den Darm entspannen.",
  "Eine sanfte, im Uhrzeigersinn ausgeführte Bauchmassage kann beruhigend wirken.",
  "Ein warmes Bad kann helfen, indem es die Bauchmuskeln entspannt.",
  "Suchen Sie unverzüglich Ihren Arzt auf, wenn seit mehr als 3 Tagen kein Stuhlgang war, wenn Blut im Stuhl ist oder wenn starkes Weinen/Bauchblähung auftritt."
];
const CONSTIPATION_TIPS_BY_LANG = { tr: CONSTIPATION_TIPS_TR, en: CONSTIPATION_TIPS_EN, de: CONSTIPATION_TIPS_DE };
function getConstipationTips(lang) { return CONSTIPATION_TIPS_BY_LANG[lang] || CONSTIPATION_TIPS_TR; }
const CONSTIPATION_TIPS = CONSTIPATION_TIPS_TR;

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
  {name:"Yağmur", icon: CloudRain, url:""},
  {name:"Fırtına", icon: CloudRain, url:"/audio/firtina.mp3"},
  {name:"Okyanus", icon: Waves, url:"/audio/okyanus.mp3"},
  {name:"Rüzgar", icon: Wind, noise:"white"},
  {name:"Elektrik Süpürgesi", icon: Wind, noise:"white"},
  {name:"Fön Makinesi", icon: Wind, noise:"white"}
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

const SHOPPING_BY_AGE_TR = {
  "Hastane Çantası (Doğum Öncesi)": ["Zıbın (5-6 adet)","Body (5-6 adet)","Tulum (3-4 adet)","Kundak/Battaniye","Bebek Bezi (Yenidoğan)","Islak Mendil","Bebek Şapkası","Patik/Çorap","Kalın Battaniye","Göbek Bandı","Bebek Tırnak Makası"],
  "0-3 Ay — Bakım & Hijyen": ["Bebek Bezi","Islak Mendil","Pamuk","Bebek Şampuanı","Bebek Sabunu/Duş Jeli","Bebek Losyonu","Pişik Kremi","Bebek Yağı","Serum Fizyolojik","Aspiratör","Termometre","Tırnak Makası/Törpü","Saç Fırçası/Tarak","Banyo Küveti","Kapüşonlu Banyo Havlusu"],
  "0-3 Ay — Giyim": ["Zıbın","Body","Tulum","Kundak","Patik/Çorap","Eldiven","Bere/Şapke","Uyku Tulumu"],
  "0-3 Ay — Beslenme": ["Emzik","Biberon","Biberon Fırçası","Biberon Sterilizatörü","Mama Isıtıcı","Emzirme Yastığı","Göğüs Pedi","Süt Sağma Pompası","Süt Saklama Poşeti","Mama Önlüğü"],
  "0-3 Ay — Uyku & Güvenlik": ["Beşik/Karyola","Bebek Yatak Seti","Bebek Uyku Tulumu","Bebek Monitörü","Gece Lambası","Uyku Pozisyoneri","Beşik Filesi"],
  "0-3 Ay — Dışarıda": ["Bebek Arabası","Puset","Ana Kucağı (Port Bebe)","Kanguru (Bebek Taşıyıcı)","Oto Koltuğu (0+ Grup)","Anne Çantası","Yağmurluk/Rüzgarlık"],
  "3-6 Ay": ["Diş Kaşıyıcı","Banyo Oyuncakları","Aktivite Matı","Ayna Oyuncak","Çıngırak","Salıncak/Ana Kucağı Sallanır","Bebek Jimnastik Seti"],
  "6-9 Ay": ["Mama Sandalyesi","Yumuşak Uçlu Kaşık-Çatal Seti","Alıştırma Bardağı","Bebek Öğütücü/Blender","Kırma Mama Kapları","Uzun Kollu Önlük","Emekleme Dizliği","Oyun Parkı (Park Yatağı)","Merdiven/Kapı Güvenlik Kapısı"],
  "9-12 Ay": ["Destekli Yürüteç","Denge Bisikleti","Yumuşak Tabanlı İlk Ayakkabı","Bloklar/İstif Oyuncakları","Bez/Karton Kitap","Priz Koruyucu","Köşe Koruyucu"],
  "12-24 Ay": ["Yürüteç/Denge Aracı","Eğitici Oyuncaklar","Yumuşak Ayakkabı/Sandalet","Kaşık-Çatal Seti","Lazımlık/Klozet Adaptörü","Banyo Basamağı","Oto Koltuğu (Grup 1)","Kum Havuzu Oyuncakları"],
  "2-3 Yaş": ["Üç Tekerlekli Bisiklet","Boyama Seti","Kitaplık","Puzzle","Legolar/Yapı Oyuncakları","Lazımlık Eğitim Seti","Büyük Çocuk Yatağı","Kreş Sırt Çantası"]
};
const SHOPPING_BY_AGE_EN = {
  "Hospital Bag (Pre-birth)": ["Onesies (5-6)","Bodysuits (5-6)","Rompers (3-4)","Swaddle/Blanket","Newborn Diapers","Wet Wipes","Baby Hat","Booties/Socks","Warm Blanket","Umbilical Band","Baby Nail Clipper"],
  "0-3 mo — Care & Hygiene": ["Diapers","Wet Wipes","Cotton Pads","Baby Shampoo","Baby Wash/Soap","Baby Lotion","Diaper Rash Cream","Baby Oil","Saline Solution","Nasal Aspirator","Thermometer","Nail Clipper/File","Hairbrush/Comb","Baby Bathtub","Hooded Bath Towel"],
  "0-3 mo — Clothing": ["Onesies","Bodysuits","Rompers","Swaddle","Booties/Socks","Mittens","Hat/Cap","Sleep Sack"],
  "0-3 mo — Feeding": ["Pacifier","Baby Bottle","Bottle Brush","Bottle Sterilizer","Bottle Warmer","Nursing Pillow","Breast Pads","Breast Pump","Milk Storage Bags","Feeding Bib"],
  "0-3 mo — Sleep & Safety": ["Crib/Bassinet","Crib Bedding Set","Sleep Sack","Baby Monitor","Night Light","Sleep Positioner","Crib Net (Mosquito)"],
  "0-3 mo — On the Go": ["Stroller","Pushchair","Bassinet Pram","Baby Carrier","Car Seat (Group 0+)","Diaper Bag","Rain/Wind Cover"],
  "3-6 mo": ["Teether","Bath Toys","Activity Mat","Mirror Toy","Rattle","Baby Swing/Rocker","Gym Set"],
  "6-9 mo": ["High Chair","Soft-Tip Spoon-Fork Set","Sippy Cup","Baby Food Blender","Feeding Bowls","Long-Sleeve Bib","Knee Pads for Crawling","Play Pen","Stair/Door Safety Gate"],
  "9-12 mo": ["Push Walker","Balance Bike","Soft-Sole First Shoes","Stacking Blocks","Board/Cloth Books","Outlet Covers","Corner Guards"],
  "12-24 mo": ["Walker/Balance Bike","Educational Toys","Soft Shoes/Sandals","Spoon-Fork Set","Potty/Toilet Seat","Bath Step Stool","Car Seat (Group 1)","Sandbox Toys"],
  "2-3 y": ["Tricycle","Coloring Set","Bookshelf","Puzzle","Building Blocks/Lego","Potty Training Set","Toddler Bed","Preschool Backpack"]
};
const SHOPPING_BY_AGE_DE = {
  "Klinik-Tasche (vor der Geburt)": ["Bodys (5-6)","Strampler (5-6)","Overalls (3-4)","Pucktuch/Decke","Neugeborenenwindeln","Feuchttücher","Babymütze","Söckchen","Warme Decke","Nabelbinde","Baby-Nagelschere"],
  "0-3 Mon. — Pflege & Hygiene": ["Windeln","Feuchttücher","Wattepads","Baby-Shampoo","Baby-Waschgel","Babylotion","Wundschutzcreme","Babyöl","Kochsalzlösung","Nasensauger","Fieberthermometer","Nagelschere/-feile","Haarbürste/Kamm","Babybadewanne","Kapuzenhandtuch"],
  "0-3 Mon. — Kleidung": ["Bodys","Strampler","Overalls","Pucktuch","Söckchen","Fäustlinge","Mütze","Schlafsack"],
  "0-3 Mon. — Fütterung": ["Schnuller","Babyflasche","Flaschenbürste","Sterilisator","Flaschenwärmer","Stillkissen","Stilleinlagen","Milchpumpe","Milchbeutel","Lätzchen"],
  "0-3 Mon. — Schlafen & Sicherheit": ["Babybett/Wiege","Bettwäsche-Set","Schlafsack","Babyphone","Nachtlicht","Schlafpositionierer","Bettnetz"],
  "0-3 Mon. — Unterwegs": ["Kinderwagen","Buggy","Babyschale","Babytrage","Autositz (Gruppe 0+)","Wickeltasche","Regen-/Windschutz"],
  "3-6 Mon.": ["Beißring","Badespielzeug","Activity-Decke","Spiegel-Spielzeug","Rassel","Babyschaukel","Gym-Set"],
  "6-9 Mon.": ["Hochstuhl","Weiches Löffel-Gabel-Set","Trinklernbecher","Babynahrungsmühle","Fütterschalen","Langarm-Lätzchen","Krabbelknieschoner","Laufgitter","Treppen-/Türschutzgitter"],
  "9-12 Mon.": ["Lauflernwagen","Laufrad","Weiche erste Schuhe","Stapelbausteine","Pappbilderbücher","Steckdosenschutz","Eckenschutz"],
  "12-24 Mon.": ["Lauflernwagen/Laufrad","Lernspielzeug","Weiche Schuhe/Sandalen","Löffel-Gabel-Set","Töpfchen/Toilettensitz","Badetritt","Autositz (Gruppe 1)","Sandkastenspielzeug"],
  "2-3 Jahre": ["Dreirad","Malset","Bücherregal","Puzzle","Bausteine/Lego","Töpfchentraining-Set","Kinderbett","Kita-Rucksack"]
};
const SHOPPING_BY_AGE_BY_LANG = { tr: SHOPPING_BY_AGE_TR, en: SHOPPING_BY_AGE_EN, de: SHOPPING_BY_AGE_DE };
function getShoppingByAge(lang) { return SHOPPING_BY_AGE_BY_LANG[lang] || SHOPPING_BY_AGE_TR; }
const SHOPPING_BY_AGE = SHOPPING_BY_AGE_TR;

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
// Rozetler artık sabit "kazanıldı" bayrağı yerine, annenin uygulamada
// gerçekten yaptığı işlemlere (emzirme sayısı, anı günlüğü kayıtları,
// çocuğun yaşı) göre otomatik olarak açılır. Her rozet, elindeki verilerle
// (ctx) bir { earned, current, target } sonucu üreten bir check fonksiyonu
// taşır.
const BADGES = [
  {title:"100 Emzirme", icon: Heart,
    check: (ctx)=>({earned: ctx.emzirmeCount>=100, current: Math.min(ctx.emzirmeCount,100), target:100})},
  {title:"İlk Gülümseme", icon: Smile,
    check: (ctx)=>({earned: ctx.hasMemory("İlk Gülümseme"), current: ctx.hasMemory("İlk Gülümseme")?1:0, target:1})},
  {title:"İlk Diş", icon: Smile,
    check: (ctx)=>({earned: ctx.hasMemory("İlk Diş"), current: ctx.hasMemory("İlk Diş")?1:0, target:1})},
  {title:"İlk Adım", icon: Activity,
    check: (ctx)=>({earned: ctx.hasMemory("İlk Adım"), current: ctx.hasMemory("İlk Adım")?1:0, target:1})},
  {title:"İlk Kelime", icon: MessageCircle,
    check: (ctx)=>({earned: ctx.hasMemory("İlk Kelime"), current: ctx.hasMemory("İlk Kelime")?1:0, target:1})},
  {title:"10 Anı Kaydı", icon: Star,
    check: (ctx)=>({earned: ctx.memoryCount>=10, current: Math.min(ctx.memoryCount,10), target:10})},
  {title:"1 Yaş", icon: Award,
    check: (ctx)=>({earned: ctx.ageMonths!=null && ctx.ageMonths>=12, current: Math.min(ctx.ageMonths??0,12), target:12})},
  {title:"2 Yaş", icon: Award,
    check: (ctx)=>({earned: ctx.ageMonths!=null && ctx.ageMonths>=24, current: Math.min(ctx.ageMonths??0,24), target:24})},
  {title:"3 Yaş", icon: Award,
    check: (ctx)=>({earned: ctx.ageMonths!=null && ctx.ageMonths>=36, current: Math.min(ctx.ageMonths??0,36), target:36})}
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
// "YYYY-MM-DD" formatındaki tarihler için gün farkı ve gün ekleme yardımcıları
// (regl takvimi gibi salt tarih bazlı hesaplamalarda saat dilimi kaymalarını önler).
function daysBetweenISO(isoA, isoB) {
  const a = new Date(isoA + "T00:00:00");
  const b = new Date(isoB + "T00:00:00");
  return Math.round((b - a) / (1000*60*60*24));
}
function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

/* ============================================================
   KALICI DEPOLAMA YARDIMCILARI (Firestore)
   ------------------------------------------------------------
   ÖNEMLİ: Bu fonksiyonlar eskiden window.storage (yalnızca Claude
   artifact önizlemesinde var olan, gerçek tarayıcıda tanımsız olan
   bir API) kullanıyordu — bu yüzden gerçek sitede hiçbir şey
   kaydedilmiyordu (try/catch hatayı yutup sessizce null/false
   döndürüyordu). Şimdi auth.js'teki Firebase Auth mimarisiyle
   tutarlı olarak Firestore kullanıyor:
     - shared=false → users/{uid}/data/{key}  (kullanıcıya özel)
     - shared=true  → shared/{key}            (herkese açık/ortak)
   auth.currentUser her zaman dolu olmalı çünkü watchAuthState
   (auth.js) kullanıcı yoksa otomatik anonim oturum açıyor; App.jsx
   "main" fazına ancak bu callback'ten sonra geçiyor. Yine de ekstra
   güvenlik olarak currentUser boşsa sessizce null/false dönülür.

   ⚠️ Firestore Security Rules ayarlamadan bu fonksiyonlar "permission
   denied" hatasıyla başarısız olur (yine sessizce, try/catch içinde).
   Önerilen kurallar için services/firestore.rules dosyasına bak.
   ============================================================ */
async function storageGet(key, shared=false) {
  try {
    if (!shared && !auth.currentUser) return null;
    const ref = shared
      ? doc(db, "shared", key)
      : doc(db, "users", auth.currentUser.uid, "data", key);
    const snap = await getDoc(ref);
    return snap.exists() ? JSON.parse(snap.data().json) : null;
  } catch (e) {
    console.error("[storageGet]", key, e);
    return null;
  }
}
async function storageSet(key, value, shared=false) {
  try {
    if (!shared && !auth.currentUser) return false;
    const ref = shared
      ? doc(db, "shared", key)
      : doc(db, "users", auth.currentUser.uid, "data", key);
    await setDoc(ref, { json: JSON.stringify(value), updatedAt: Date.now() });
    return true;
  } catch (e) {
    console.error("[storageSet]", key, e);
    return false;
  }
}

/* ============================================================
   PREMIUM / ÜCRETSİZ KATMAN SINIRLAMASI
   ============================================================
   ÖNEMLİ — GÜVENLİK NOTU: Bu bayrak (profile:premium) Firestore'da
   istemci tarafında tutulur. MVP / test aşaması için yeterlidir ama
   teknik bir kullanıcı tarayıcı konsolundan bu değeri değiştirip
   "sahte" premium elde edebilir. Gerçek/canlı yayında bunu güvenli
   hale getirmek için: mobil uygulamada RevenueCat + App Store/Play
   Store IAP makbuz doğrulaması, web'de ise bir ödeme sağlayıcısının
   (iyzico/Stripe/PayTR) webhook'uyla SUNUCU tarafında set edilen bir
   "premium" alanı kullanılmalı — istemcinin kendi kendine yazdığı bir
   değere asla güvenilmemeli. Şu anki PaymentMethodModal, bu mimariyi
   test edebilmeniz için premium'u yerel olarak aktifleştiren bir
   DEMO'dur; gerçek tahsilat yapmaz.
   ============================================================ */
const FREE_AI_DAILY_LIMIT = 5; // ücretsiz kullanıcıların günlük asistan mesaj hakkı

async function getPremiumStatus() {
  const saved = await storageGet("profile:premium", false);
  return (saved && saved.active) ? saved : {active:false, since:null, source:null};
}
async function setPremiumStatus(active, source="demo_card") {
  const val = {active, since: active ? todayISO() : null, source: active ? source : null};
  await storageSet("profile:premium", val, false);
  return val;
}
// Component'ler içinde reaktif olarak premium durumunu okumak için.
function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(true);
  const refreshPremium = async () => {
    const status = await getPremiumStatus();
    setIsPremium(!!status.active);
    return !!status.active;
  };
  useEffect(()=>{ (async ()=>{ await refreshPremium(); setLoadingPremium(false); })(); }, []);
  return { isPremium, loadingPremium, refreshPremium };
}

// Ücretsiz kullanıcılar için günlük AI (Asistan) mesaj sayacı — her gün sıfırlanır.
async function getAIUsageToday() {
  const today = todayISO();
  const saved = await storageGet("usage:assistant", false);
  if (!saved || saved.date !== today) return {date: today, count: 0};
  return saved;
}
async function incrementAIUsage() {
  const usage = await getAIUsageToday();
  const updated = {date: usage.date, count: usage.count + 1};
  await storageSet("usage:assistant", updated, false);
  return updated;
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

// Overpass'ın tüm aynaları başarısız olursa (ör. ağ engeli), Nominatim'in
// isim tabanlı arama uç noktasıyla yedek bir sonuç seti dener. Overpass
// kadar yapısal değildir (etikete göre değil isme göre arar) ama en azından
// eczaneler tamamen listesiz kalmaz.
async function nominatimSearchNearby(lat, lon, radiusM, query) {
  const dLat = radiusM / 111320;
  const dLon = radiusM / (111320 * Math.cos(lat * Math.PI/180));
  const viewbox = `${lon-dLon},${lat+dLat},${lon+dLon},${lat-dLat}`;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=20&accept-language=tr`;
  const res = await fetchWithTimeout(url, { headers: { "Accept": "application/json" } }, 15000);
  if (!res.ok) throw new Error("nominatim_error");
  const data = await res.json();
  return (data||[]).map(d => ({
    id: `n/${d.place_id}`,
    name: (d.display_name||"").split(",")[0] || "İsimsiz",
    lat: parseFloat(d.lat), lon: parseFloat(d.lon),
    address: (d.display_name||"").split(",").slice(1,3).join(",").trim(),
    phone: ""
  })).filter(p => !isNaN(p.lat) && !isNaN(p.lon));
}

// Not: overpass-api.de (ana sunucu), tarayıcıdan gelen "bot benzeri" istekleri
// sıkça 406 ile reddediyor (User-Agent tarayıcıdan JS ile değiştirilemediği için
// bu sorunu koddan çözmek mümkün değil). Bu yüzden CORS'u sorunsuz destekleyen ve
// bu tür istekleri engellemeyen ayna (private.coffee / eski adıyla kumi.systems)
// birincil sunucu olarak kullanılır; ana sunucu ise en son çare olarak dener.
const OVERPASS_MIRRORS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  return fetch(url, {...options, signal: controller.signal}).finally(()=>clearTimeout(timer));
}

function parseOverpassElements(data) {
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
}

// Bir yarıçap için tüm aynaları (mirror) dener; biri başarısız olursa
// sıradakine geçer. Hepsi başarısız olursa hata fırlatır (ağ/servis sorunu).
async function overpassNearbyOnce(lat, lon, radiusM, tagPairs) {
  const filters = tagPairs.map(([k,v]) =>
    `node["${k}"="${v}"](around:${radiusM},${lat},${lon});way["${k}"="${v}"](around:${radiusM},${lat},${lon});relation["${k}"="${v}"](around:${radiusM},${lat},${lon});`
  ).join("\n");
  const query = `[out:json][timeout:25];(${filters});out center 40;`;

  let lastErr = null;
  for (const endpoint of OVERPASS_MIRRORS) {
    // Önce POST dener; bir ağ/CORS sorunu nedeniyle POST başarısız olursa
    // aynı aynaya GET isteğiyle bir kez daha şans verir (bazı aynalarda POST
    // engellenmiş olabilir). İkisi de başarısız olursa sıradaki aynaya geçer.
    // Sorgu 25 saniyelik sunucu zaman aşımı isteyebildiği için istemci
    // zaman aşımı bundan daha kısa olmamalı (aksi halde başarılı olacak
    // bir sorgu erkenden iptal edilir).
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers: {"Content-Type":"application/x-www-form-urlencoded", "Accept":"application/json, */*"},
        body: "data=" + encodeURIComponent(query)
      }, 27000);
      if (!res.ok) throw new Error("overpass_error_"+res.status);
      const data = await res.json();
      return parseOverpassElements(data);
    } catch (e) {
      lastErr = e;
      try {
        const res2 = await fetchWithTimeout(`${endpoint}?data=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: {"Accept":"application/json, */*"}
        }, 27000);
        if (!res2.ok) throw new Error("overpass_error_"+res2.status);
        const data2 = await res2.json();
        return parseOverpassElements(data2);
      } catch (e2) {
        lastErr = e2; // bu ayna da başarısız oldu, sıradaki aynayı dene
      }
    }
  }
  throw lastErr || new Error("overpass_error");
}

// Verilen yarıçapta sonuç bulunamazsa (kırsal/küçük yerleşim gibi düşük
// yoğunluklu OSM verisi olan bölgelerde), otomatik olarak daha geniş
// yarıçaplarla yeniden dener. Sonuç bulur bulmaz durur; tüm denemeler
// ağ hatasıyla başarısız olursa hatayı yukarı fırlatır.
// Not: azami yarıçap kasıtlı olarak sınırlı tutulur (varsayılan 40km) —
// aksi halde "yakınımda" araması, yakında hiç sonuç yoksa kullanıcının
// bulunduğu ilçeden onlarca km uzaktaki farklı bir ilçenin sonuçlarını
// "en yakın" diye gösterebilir, bu da yanıltıcı olur.
async function overpassNearby(lat, lon, radiusM, tagPairs, extraRadii=[25000, 40000]) {
  const radiiToTry = [radiusM, ...extraRadii.filter(r => r > radiusM)];
  let lastErr = null;
  for (const r of radiiToTry) {
    try {
      const results = await overpassNearbyOnce(lat, lon, r, tagPairs);
      if (results.length > 0) return results;
      lastErr = null; // istek başarılı ama bölgede sonuç yok; daha geniş dene
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  return [];
}

// Aynı işletme hem Overpass hem Nominatim sonuçlarında (farklı puanlarla)
// çıkabilir; ~110m'lik bir ızgaraya yuvarlayıp aynı hücreye düşenleri tek
// kayda indirger (ilk görülen — yapısal etiketli Overpass sonucu — korunur).
function dedupePlaces(list) {
  const seen = new Map();
  for (const p of list) {
    const key = `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`;
    if (!seen.has(key)) seen.set(key, p);
  }
  return [...seen.values()];
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
function scheduleSleepSoundAutoStop(ms, onAutoStop) {
  if (_abpSoundTimerId) { clearTimeout(_abpSoundTimerId); _abpSoundTimerId = null; }
  if (!ms) return; // sonsuz veya tanınmayan değer → otomatik durdurma yok
  _abpSoundTimerId = setTimeout(() => {
    stopSleepSound();
    if (onAutoStop) onAutoStop();
  }, ms);
}
const TIMER_OPTIONS_KEYS = [
  {key:"15", ms:15*60000},
  {key:"30", ms:30*60000},
  {key:"60", ms:60*60000},
  {key:"inf", ms:null}
];
function getTimerOptions(t) {
  return TIMER_OPTIONS_KEYS.map(o=>({...o, label: t("timer_"+o.key)}));
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

/* ============================================================
   HATIRLATICI BİLDİRİMLERİ — tarayıcının Notification API'si.
   Not: bu, sekme açıkken çalışan bir bildirimdir; sekme tamamen
   kapalıyken tetiklenebilmesi için bir service worker + push sunucusu
   gerekir (bu proje kapsamında yok). Uygulama açık/arka planda
   sekme olarak açıkken hatırlatıcılar zamanı geldiğinde bildirim
   ve uygulama içi toast olarak kullanıcıyı uyarır.
   ============================================================ */
function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return Promise.resolve("unsupported");
  if (Notification.permission === "granted" || Notification.permission === "denied") return Promise.resolve(Notification.permission);
  return Notification.requestPermission();
}
function fireReminderNotification(title, body) {
  try {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, tag: "abp-reminder-"+title });
    }
  } catch (e) { /* bildirim desteklenmiyorsa sessizce geç */ }
}
// Hatırlatıcı kartında gösterilecek tarih/saat metni
function reminderTimeLabel(r) {
  if (r.repeat === "daily") return r.time ? `Her gün · ${r.time}` : "Her gün";
  if (r.date && r.time) return `${formatDateTR(new Date(r.date+"T00:00:00"))} · ${r.time}`;
  if (r.date) return formatDateTR(new Date(r.date+"T00:00:00"));
  if (r.time) return r.time;
  return "Tarih belirtilmedi";
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
  {key:"today", labelKey:"nav_today", icon: Home},
  {key:"track", labelKey:"nav_track", icon: Activity},
  {key:"activities", labelKey:"nav_activities", icon: Sparkles},
  {key:"nearby", labelKey:"nav_nearby", icon: MapPin},
  {key:"community", labelKey:"nav_community", icon: Users},
  {key:"assistant", labelKey:"nav_assistant", icon: MessageCircle},
  {key:"profile", labelKey:"nav_profile", icon: User}
];
function BottomNav({active, onChange}) {
  const { t } = useLang();
  return (
    <div style={{
      position:"absolute", bottom:0, left:0, right:0, display:"flex",
      background:"var(--card)", borderTop:"1px solid rgba(150,130,180,0.12)",
      padding:"10px 6px 18px", boxShadow:"0 -8px 24px -16px rgba(90,70,130,0.25)"
    }}>
      {TABS.map(tab=>{
        const Icon = tab.icon; const isActive = active===tab.key;
        return (
          <div key={tab.key} onClick={()=>onChange(tab.key)} className="abp-tap" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0"}}>
            <div style={{width:34,height:34,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background: isActive? "var(--pink)":"transparent"}}>
              <Icon size={18} color={isActive?"var(--ink)":"var(--ink-faint)"} strokeWidth={isActive?2.2:1.8}/>
            </div>
            <div style={{fontSize:10.5,fontWeight:700,color: isActive?"var(--ink)":"var(--ink-faint)"}}>{t(tab.labelKey)}</div>
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
  const { t } = useLang();
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
          <div style={{fontSize:12.5,color:"var(--ink-soft)",fontWeight:600}}>{t("today_greeting")}</div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"2px 0 0"}}>{child.name}</h2>
        </div>
        <div style={{width:40,height:40,borderRadius:20,background:"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Bell size={17}/>
        </div>
      </div>

      <div className="abp-fade-up" style={{marginTop:18}} onClick={()=> isPregnant ? onOpenPregnancy() : onOpenChild()}>
        {isPregnant ? (
          <DayRing percent={(info.week/40)*100} big={t("today_week_label", info.week)} small={t("today_day_fruit", info.dayInWeek, info.data.fruit.toLowerCase())}/>
        ) : (
          <DayRing percent={clamp((info.months/72)*100,4,100)} big={info.years>0?t("today_age_years", info.years, info.remMonths):t("today_age_months", info.months)} small={t("today_child_day", info.days)}/>
        )}
      </div>

      <div className="abp-fade-up abp-tap" onClick={()=>window.open("https://annepazari.netlify.app/", "_blank", "noopener,noreferrer")} style={{
        marginTop:18, borderRadius:"var(--radius-lg)", padding:16,
        background:"linear-gradient(120deg, #F6B8CE 0%, #E8A9C4 45%, #C6B3F0 100%)",
        display:"flex", alignItems:"center", gap:14, boxShadow:"var(--shadow-sm)", position:"relative", overflow:"hidden"
      }}>
        <div style={{width:46,height:46,borderRadius:16,background:"rgba(255,255,255,0.55)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <ShoppingBag size={22} color="#5A3B50"/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div className="abp-display" style={{fontWeight:800,fontSize:15,color:"#3A2A3B"}}>{t("today_market_title")}</div>
          <div style={{fontSize:12,color:"#5A3B50",marginTop:2,fontWeight:600}}>{t("today_market_desc")}</div>
        </div>
        <ChevronRight size={20} color="#5A3B50" style={{flexShrink:0}}/>
      </div>

      <SectionTitle>{t("today_cards_title")}</SectionTitle>
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
          <p style={{fontSize:12.5,color:"var(--ink-faint)"}}>{t("today_cards_refresh_note")}</p>
        </Modal>
      )}
    </div>
  );
}

const EmptyState = ({text}) => {
  const { t } = useLang();
  return (
    <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,background:"var(--bg)",padding:30,textAlign:"center"}}>
      <IconBadge icon={Baby} color="pink" size={60}/>
      <div style={{fontWeight:700}}>{text || t("empty_state_default")}</div>
    </div>
  );
};

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
  const [soundTimer, setSoundTimer] = useState(30*60000);
  const quickSounds = SLEEP_SOUNDS.slice(0,6); // Beyaz, Kahverengi, Pembe Gürültü, Yağmur, Fırtına, Okyanus

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
              {TIMER_OPTIONS_KEYS.map(opt=>(
                <Pill_ key={opt.key} active={soundTimer===opt.ms} onClick={()=>{ setSoundTimer(opt.ms); scheduleSleepSoundAutoStop(opt.ms, ()=>setPlayingSound(null)); }}>{{15:"15 dk",30:"30 dk",60:"1 saat"}[opt.ms/60000] || "Sonsuz"}</Pill_>
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
  const { t, lang } = useLang();
  const isPregnant = child?.status === "pregnant";
  const [sub, setSub] = useState(isPregnant ? "kilo" : "emzirme");
  const [logs, setLogs] = useState({emzirme:[], mama:[], uyku:[], bez:[], kilo:[], tekme:[], kasilma:[]});
  const childId = child?.id || "default";
  // Her log tipi çocuğa özel bir key altında kalıcı olarak saklanır:
  // örn. "kilo:123", "emzirme:123". Önceden bu kayıtlar yalnızca
  // component state'inde tutuluyordu; sekme değiştirince veya sayfa
  // yenilenince tüm geçmiş kayboluyordu.
  const LOG_TYPES = ["emzirme","mama","uyku","bez","kilo","tekme","kasilma"];

  useEffect(()=>{
    let cancelled = false;
    (async ()=>{
      const entries = await Promise.all(LOG_TYPES.map(type=>storageGet(`${type}:${childId}`, false)));
      if (cancelled) return;
      const next = {};
      LOG_TYPES.forEach((type,i)=>{ next[type] = entries[i] || []; });
      setLogs(next);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const addLog = (type, entry) => setLogs(prev => {
    const list = [entry, ...prev[type]];
    storageSet(`${type}:${childId}`, list, false); // kalıcı kayıt (fire-and-forget)
    return {...prev, [type]: list};
  });

  const subTabs = isPregnant ? [
    {key:"kilo", label:t("track_sub_weight")},
    {key:"tekme", label:t("track_sub_kick")},
    {key:"kasilma", label:t("track_sub_contraction")},
    {key:"randevu", label:t("track_sub_appointments")},
    {key:"uyku", label:t("track_sub_sleep")},
    {key:"regl", label:t("track_sub_regl")}
  ] : [
    {key:"emzirme", label:t("track_sub_breastfeeding")},
    {key:"mama", label:t("track_sub_formula")},
    {key:"beslenme", label:t("track_sub_foodlist")},
    {key:"uyku", label:t("track_sub_sleep")},
    {key:"bez", label:t("track_sub_diaper")},
    {key:"kaka", label:t("track_sub_poop")},
    {key:"dis", label:t("track_sub_teething")},
    {key:"asi", label:t("track_sub_vaccine")},
    {key:"ekgida", label:t("track_sub_weaning")},
    {key:"regl", label:t("track_sub_regl")}
  ];

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>{t("track_title")}</h2>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {subTabs.map(tb => <Pill_ key={tb.key} active={sub===tb.key} onClick={()=>setSub(tb.key)}>{tb.label}</Pill_>)}
      </div>

      {isPregnant && sub === "kilo" && (
        <TrackerBoard
          title={t("tracker_weight_title")} color="purple" icon={Weight}
          fields={[{key:"weight_kg", label:t("field_weight_kg")}]}
          onLog={(vals)=>addLog("kilo",{...vals, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.kilo}
          renderLog={(l)=>t("weight_log_render", l.time, l.weight_kg||0)}
        />
      )}
      {isPregnant && sub === "tekme" && (
        <KickCounter logs={logs.tekme} onLog={(entry)=>addLog("tekme",entry)}/>
      )}
      {isPregnant && sub === "kasilma" && (
        <ContractionTimer logs={logs.kasilma} onLog={(entry)=>addLog("kasilma",entry)}/>
      )}
      {isPregnant && sub === "randevu" && <AppointmentList/>}
      {isPregnant && sub === "regl" && <PeriodCalendar/>}

      {sub === "emzirme" && (
        <TrackerBoard
          title={t("tracker_breastfeeding_title")} color="pink" icon={Heart}
          fields={[{key:"right_breast", label:t("field_right_breast")},{key:"left_breast", label:t("field_left_breast")}]}
          onLog={async (vals)=>{
            addLog("emzirme",{...vals, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})});
            // Rozetler (örn. "100 Emzirme") gerçek kullanım sayısına göre
            // otomatik açılabilsin diye toplam emzirme sayısı kalıcı olarak saklanır.
            const prev = (await storageGet("stats:emzirmeCount", false)) || {count:0};
            await storageSet("stats:emzirmeCount", {count:(prev.count||0)+1}, false);
          }}
          logs={logs.emzirme}
          renderLog={(l)=>t("breastfeeding_log_render", l.time, l.right_breast||0, l.left_breast||0)}
        />
      )}
      {sub === "mama" && (
        <TrackerBoard
          title={t("tracker_formula_title")} color="blue" icon={Utensils}
          fields={[{key:"formula_ml", label:t("field_formula_ml")},{key:"breastmilk_ml", label:t("field_breastmilk_ml")},{key:"water_ml", label:t("field_water_ml")}]}
          onLog={(vals)=>addLog("mama",{...vals, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.mama}
          renderLog={(l)=>t("formula_log_render", l.time, l.formula_ml||0, l.breastmilk_ml||0, l.water_ml||0)}
        />
      )}
      {sub === "uyku" && (
        <TrackerBoard
          title={t("tracker_sleep_title")} color="purple" icon={MoonIcon}
          fields={[{key:"duration_min", label:t("field_duration_min")}]}
          onLog={(vals)=>addLog("uyku",{...vals, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.uyku}
          renderLog={(l)=>t("sleep_log_render", l.time, l.duration_min||0)}
          extra={
            <Card style={{marginTop:14}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:8}}>{t("tracker_sleep_weekly_chart")}</div>
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
          title={t("tracker_diaper_title")} color="green" icon={Droplets}
          fields={[]}
          customButtons={[{key:"pee", label:t("diaper_pee")},{key:"poop", label:t("diaper_poop")},{key:"both", label:t("diaper_both")}]}
          onLog={(vals)=>addLog("bez",{type:vals.type, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})})}
          logs={logs.bez}
          renderLog={(l)=>t("diaper_log_render", l.time, l.type)}
        />
      )}
      {sub === "beslenme" && <FoodLogSection childId={child?.id}/>}
      {sub === "kaka" && <PoopTrackerSection childId={child?.id}/>}
      {sub === "dis" && <TeethingSection childId={child?.id}/>}
      {sub === "asi" && <VaccineList child={child}/>}
      {sub === "ekgida" && <WeaningCalendar childId={child?.id}/>}
      {sub === "regl" && <PeriodCalendar/>}
    </div>
  );
}

/* ============================================================
   REGL TAKVİMİ — anneye özel, çocuktan bağımsız döngü takibi.
   Regl başlangıç/bitiş tarihleri kalıcı olarak saklanır; geçmiş
   döngülerden ortalama döngü ve regl süresi otomatik hesaplanır,
   bir sonraki regl / doğurgan dönem / yumurtlama günü buna göre
   tahmin edilip aylık takvim üzerinde renklerle gösterilir.
   ============================================================ */
const WEEKDAY_LABELS_TR = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];

function PeriodCalendar() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]); // [{id, start:"YYYY-MM-DD", end:"YYYY-MM-DD"|null}]
  const [avgCycle, setAvgCycle] = useState(28);
  const [avgPeriod, setAvgPeriod] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState({cycle:"28", period:"5"});
  const [viewDate, setViewDate] = useState(()=>{ const d=new Date(); return {y:d.getFullYear(), m:d.getMonth()}; });
  const [logModal, setLogModal] = useState(null); // {mode:"start"|"end", date:"YYYY-MM-DD"} | null

  useEffect(()=>{ (async ()=>{
    setLoading(true);
    const savedCycles = await storageGet("regl:cycles", false);
    const savedSettings = await storageGet("regl:settings", false);
    setCycles(savedCycles || []);
    if (savedSettings) {
      setAvgCycle(savedSettings.avgCycle || 28);
      setAvgPeriod(savedSettings.avgPeriod || 5);
    }
    setLoading(false);
  })(); }, []);

  const saveCycles = async (list) => {
    setCycles(list);
    await storageSet("regl:cycles", list, false);
  };

  const sorted = [...cycles].sort((a,b)=> b.start.localeCompare(a.start)); // en yeni önce
  const current = sorted.find(c=>!c.end); // devam eden regl varsa
  const last = sorted[0];
  const todayStr = todayISO();

  // Geçmiş kayıtlardan ortalama döngü uzunluğu (son 6 döngü)
  const computedAvgCycle = (() => {
    const startsAsc = sorted.map(c=>c.start).slice().sort();
    if (startsAsc.length < 2) return avgCycle;
    const diffs = [];
    for (let i=1;i<startsAsc.length;i++) diffs.push(daysBetweenISO(startsAsc[i-1], startsAsc[i]));
    const recent = diffs.slice(-6).filter(d=>d>0 && d<90);
    if (!recent.length) return avgCycle;
    return Math.round(recent.reduce((a,b)=>a+b,0)/recent.length);
  })();
  // Geçmiş kayıtlardan ortalama regl süresi (son 6 kapanmış döngü)
  const computedAvgPeriod = (() => {
    const lens = sorted.filter(c=>c.end).map(c=>daysBetweenISO(c.start,c.end)+1).filter(n=>n>0 && n<20);
    if (!lens.length) return avgPeriod;
    const recent = lens.slice(0,6);
    return Math.round(recent.reduce((a,b)=>a+b,0)/recent.length);
  })();

  const nextPredictedStart = last ? addDaysISO(last.start, computedAvgCycle) : null;
  const predictedEnd = nextPredictedStart ? addDaysISO(nextPredictedStart, computedAvgPeriod-1) : null;
  const ovulationDay = nextPredictedStart ? addDaysISO(nextPredictedStart, -14) : null;
  const fertileStart = ovulationDay ? addDaysISO(ovulationDay, -5) : null;
  const fertileEnd = ovulationDay ? addDaysISO(ovulationDay, 1) : null;
  const daysUntilNext = nextPredictedStart ? daysBetweenISO(todayStr, nextPredictedStart) : null;
  const cycleDay = last ? daysBetweenISO(last.start, todayStr) + 1 : null;

  const startPeriod = async (date=todayStr) => {
    if (current) return;
    const entry = {id: Date.now(), start: date, end: null};
    await saveCycles([entry, ...cycles]);
    showToast(t("toast_regl_started"));
    setLogModal(null);
  };
  const endPeriod = async (date=todayStr) => {
    if (!current) return;
    const finalEnd = date < current.start ? current.start : date; // bitiş, başlangıçtan önce olamaz
    const list = cycles.map(c => c.id===current.id ? {...c, end: finalEnd} : c);
    await saveCycles(list);
    showToast(t("toast_regl_ended"));
    setLogModal(null);
  };
  const confirmLogModal = () => {
    if (!logModal) return;
    if (logModal.mode === "start") startPeriod(logModal.date);
    else endPeriod(logModal.date);
  };
  const removeCycle = async (id) => {
    if (!window.confirm(t("regl_delete_confirm"))) return;
    await saveCycles(cycles.filter(c=>c.id!==id));
    showToast(t("toast_entry_removed"));
  };
  const saveSettings = async () => {
    const cycle = clamp(parseInt(settingsDraft.cycle,10) || 28, 15, 60);
    const period = clamp(parseInt(settingsDraft.period,10) || 5, 1, 15);
    setAvgCycle(cycle); setAvgPeriod(period);
    await storageSet("regl:settings", {avgCycle:cycle, avgPeriod:period}, false);
    setShowSettings(false);
    showToast(t("toast_regl_settings_saved"));
  };

  // Takvim ızgarası (Pazartesi başlangıçlı)
  const {y,m} = viewDate;
  const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m+1, 0).getDate();
  const isoOf = (d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({length:daysInMonth}, (_,i)=>i+1)];

  const dayStatus = (d) => {
    const iso = isoOf(d);
    for (const c of cycles) {
      if (c.end) { if (iso >= c.start && iso <= c.end) return "period"; }
      else if (iso >= c.start && iso <= todayStr) return "period";
    }
    if (nextPredictedStart && predictedEnd && iso >= nextPredictedStart && iso <= predictedEnd) return "predicted";
    if (ovulationDay && iso === ovulationDay) return "ovulation";
    if (fertileStart && fertileEnd && iso >= fertileStart && iso <= fertileEnd) return "fertile";
    return null;
  };

  const STATUS_STYLE = {
    period:    {background:"linear-gradient(135deg, #E8A9C4, #D9526B)", color:"#fff"},
    predicted: {background:"var(--pink)", color:"var(--ink)"},
    fertile:   {background:"var(--purple)", color:"var(--ink)"},
    ovulation: {background:"var(--purple-deep)", color:"#fff"}
  };

  return (
    <div style={{marginTop:16}}>
      <Card style={{background:"linear-gradient(135deg, #E8A9C4, #B79AEA)", color:"#fff"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontWeight:800,fontSize:16}}>
              {current ? t("regl_active_period") : cycleDay!=null ? t("regl_day_of_cycle", cycleDay) : t("regl_subtitle")}
            </div>
            <div style={{fontSize:12.5,marginTop:6,opacity:0.92}}>
              {!last ? t("regl_next_period_unknown")
                : daysUntilNext===0 ? t("regl_next_period_today")
                : daysUntilNext===1 ? t("regl_next_period_tomorrow")
                : daysUntilNext>1 ? t("regl_next_period_in", daysUntilNext)
                : t("regl_next_period_late", Math.abs(daysUntilNext))}
            </div>
          </div>
          <Droplet size={30} color="#fff"/>
        </div>
        <div style={{display:"flex",gap:16,marginTop:14,fontSize:11.5,opacity:0.92}}>
          <div>{t("regl_cycle_length_label", computedAvgCycle)}</div>
          <div>{t("regl_period_length_label", computedAvgPeriod)}</div>
        </div>
      </Card>

      <div style={{display:"flex",gap:8,marginTop:12}}>
        {!current ? (
          <PrimaryButton style={{flex:1}} onClick={()=>startPeriod()}>{t("regl_start_btn")}</PrimaryButton>
        ) : (
          <PrimaryButton style={{flex:1}} onClick={()=>endPeriod()}>{t("regl_end_btn")}</PrimaryButton>
        )}
        <GhostButton style={{width:52,padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>{ setSettingsDraft({cycle:String(avgCycle), period:String(avgPeriod)}); setShowSettings(true); }}>
          <Settings size={18}/>
        </GhostButton>
      </div>

      <Card style={{marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div onClick={()=>setViewDate(v=>{ const d=new Date(v.y,v.m-1,1); return {y:d.getFullYear(),m:d.getMonth()}; })} className="abp-tap" style={{width:30,height:30,borderRadius:15,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={15}/></div>
          <div style={{fontWeight:700,fontSize:14,textTransform:"capitalize"}}>{new Date(y,m,1).toLocaleDateString("tr-TR",{month:"long",year:"numeric"})}</div>
          <div onClick={()=>setViewDate(v=>{ const d=new Date(v.y,v.m+1,1); return {y:d.getFullYear(),m:d.getMonth()}; })} className="abp-tap" style={{width:30,height:30,borderRadius:15,background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={15}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>
          {WEEKDAY_LABELS_TR.map(w=>(
            <div key={w} style={{textAlign:"center",fontSize:10.5,fontWeight:700,color:"var(--ink-faint)"}}>{w}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {cells.map((d,i)=>{
            if (d==null) return <div key={i}/>;
            const iso = isoOf(d);
            const status = dayStatus(d);
            const isToday = iso === todayStr;
            const style = status ? STATUS_STYLE[status] : {background:"var(--bg)", color:"var(--ink)"};
            return (
              <div key={i} className="abp-tap"
                onClick={()=>setLogModal({mode: current ? "end" : "start", date: iso})}
                style={{
                  aspectRatio:"1", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11.5, fontWeight:700, ...style,
                  boxShadow: isToday ? "0 0 0 2px var(--ink) inset" : "none"
                }}>{d}</div>
            );
          })}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px 14px",marginTop:14,fontSize:10.5,color:"var(--ink-soft)"}}>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:9,height:9,borderRadius:3,background:"#D9526B"}}/>{t("regl_legend_period")}</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:9,height:9,borderRadius:3,background:"var(--pink)"}}/>{t("regl_legend_predicted")}</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:9,height:9,borderRadius:3,background:"var(--purple)"}}/>{t("regl_legend_fertile")}</div>
          <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:9,height:9,borderRadius:3,background:"var(--purple-deep)"}}/>{t("regl_legend_ovulation")}</div>
        </div>
      </Card>

      <SectionTitle>{t("regl_history_title")}</SectionTitle>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : sorted.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("regl_history_empty")}</Card>
      ) : sorted.map(c=>{
        const len = c.end ? daysBetweenISO(c.start,c.end)+1 : null;
        return (
          <Card key={c.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}} onClick={()=>removeCycle(c.id)}>
            <IconBadge icon={Droplet} color="pink" size={34}/>
            <div style={{flex:1,fontSize:13.5,fontWeight:600}}>{t("regl_cycle_render", c.start, c.end, len)}</div>
            <X size={14} color="var(--ink-faint)"/>
          </Card>
        );
      })}

      {logModal && (
        <Modal title={logModal.mode==="start" ? t("regl_start_btn") : t("regl_end_btn")} onClose={()=>setLogModal(null)}>
          <div style={{textAlign:"center",padding:"6px 0 20px"}}>
            <Droplet size={30} color="var(--pink)" style={{marginBottom:10}}/>
            <div style={{fontSize:16,fontWeight:800,textTransform:"capitalize"}}>{formatDateTR(new Date(logModal.date+"T00:00:00"))}</div>
          </div>
          <PrimaryButton onClick={confirmLogModal}>{t("reminder_save")}</PrimaryButton>
        </Modal>
      )}

      {showSettings && (
        <Modal title={t("regl_settings_title")} onClose={()=>setShowSettings(false)}>
          <p style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.6,marginTop:0}}>{t("regl_settings_desc")}</p>
          <Input label={t("regl_avg_cycle_label")} value={settingsDraft.cycle} onChange={(v)=>setSettingsDraft(s=>({...s,cycle:v.replace(/[^0-9]/g,"")}))} type="number"/>
          <Input label={t("regl_avg_period_label")} value={settingsDraft.period} onChange={(v)=>setSettingsDraft(s=>({...s,period:v.replace(/[^0-9]/g,"")}))} type="number"/>
          <PrimaryButton onClick={saveSettings}>{t("regl_settings_save")}</PrimaryButton>
        </Modal>
      )}
    </div>
  );
}

function TrackerBoard({title,color,icon:Icon,fields,onLog,logs,renderLog,customButtons,extra}) {
  const { t } = useLang();
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
              <div key={b.key} onClick={()=>{onLog({type:b.label}); showToast(t("toast_item_saved", b.label));}} className="abp-tap" style={{flex:1,textAlign:"center",padding:"12px 0",borderRadius:14,background:"var(--"+color+")",fontWeight:700,fontSize:13}}>{b.label}</div>
            ))}
          </div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns: fields.length>1?"1fr 1fr":"1fr", gap:10, marginBottom:10}}>
              {fields.map(f=>(
                <input key={f.key} placeholder={f.label} value={vals[f.key]||""} onChange={e=>setVals({...vals,[f.key]:e.target.value})}
                  style={{padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none"}}/>
              ))}
            </div>
            <input placeholder={t("field_note_placeholder")} value={note} onChange={e=>setNote(e.target.value)}
              style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
            <PrimaryButton onClick={()=>{onLog({...vals, not:note}); setVals({}); setNote(""); showToast(t("toast_saved"));}} style={{padding:12,fontSize:14}}>{t("save")}</PrimaryButton>
          </>
        )}
      </Card>
      {extra}
      <SectionTitle>{t("history_title")}</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("history_empty")}</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{renderLog(l)}</Card>
      ))}
    </div>
  );
}

function KickCounter({logs, onLog}) {
  const { t, lang } = useLang();
  const [count, setCount] = useState(0);
  const [startTime] = useState(()=> new Date());
  const elapsedMin = Math.max(0, Math.round((Date.now() - startTime.getTime())/60000));
  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Baby} color="pink" size={36}/>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{t("kick_counter_title")}</div>
            <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{t("kick_counter_desc")}</div>
          </div>
        </div>
        <div style={{textAlign:"center",padding:"18px 0"}}>
          <div className="abp-display" style={{fontSize:44,fontWeight:800}}>{count}</div>
          <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{t("kick_counter_movement_count", elapsedMin)}</div>
        </div>
        <div onClick={()=>setCount(c=>c+1)} className="abp-tap" style={{
          width:96,height:96,borderRadius:48,margin:"0 auto",background:"linear-gradient(135deg, #E8A9C4, #B79AEA)",
          display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 10px 24px -8px rgba(180,130,200,0.55)"
        }}>
          <Plus size={34} color="#fff"/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <GhostButton style={{flex:1,padding:12,fontSize:13}} onClick={()=>setCount(0)}>{t("reset")}</GhostButton>
          <PrimaryButton style={{flex:1,padding:12,fontSize:13}} onClick={()=>{
            onLog({count, minutes:elapsedMin, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})});
            setCount(0);
            showToast(t("toast_kick_saved"));
          }}>{t("save")}</PrimaryButton>
        </div>
      </Card>
      <SectionTitle>{t("history_title")}</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("history_empty_kick")}</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{t("kick_log_render", l.time, l.count, l.minutes)}</Card>
      ))}
    </div>
  );
}

function ContractionTimer({logs, onLog}) {
  const { t, lang } = useLang();
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
    onLog({durationSec, intervalMin, time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"})});
    setRunning(false);
    showToast(t("toast_contraction_saved"));
  };
  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Timer} color="blue" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>{t("contraction_title")}</div>
        </div>
        <div style={{textAlign:"center",padding:"14px 0"}}>
          <div className="abp-display" style={{fontSize:40,fontWeight:800}}>{String(Math.floor(elapsed/60)).padStart(2,"0")}:{String(elapsed%60).padStart(2,"0")}</div>
          <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{running ? t("contraction_running") : t("contraction_idle")}</div>
        </div>
        {running ? (
          <div onClick={stop} className="abp-tap" style={{textAlign:"center",padding:16,borderRadius:18,background:"#E38FA6",color:"#fff",fontWeight:700}}>{t("contraction_stop")}</div>
        ) : (
          <div onClick={start} className="abp-tap" style={{textAlign:"center",padding:16,borderRadius:18,background:"var(--ink)",color:"#fff",fontWeight:700}}>{t("contraction_start")}</div>
        )}
      </Card>
      <div style={{fontSize:12,color:"var(--ink-faint)",margin:"10px 4px"}}>{t("contraction_warning")}</div>
      <SectionTitle>{t("history_title")}</SectionTitle>
      {logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("history_empty_generic")}</Card>
      ) : logs.slice(0,8).map((l,i)=>(
        <Card key={i} style={{marginBottom:8,fontSize:13.5}}>{t("contraction_log_render", l.time, l.durationSec, l.intervalMin)}</Card>
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
   ADMIN / CMS PANELİ — paylaşımlı depolama (Firestore, shared/{key})
   Not: Bu, tüm bu artifact'ı kullanan kişiler arasında paylaşılan basit
   bir içerik havuzudur; gerçek kullanıcı rolleri veya güvenlik sağlamaz.
   ============================================================ */
function CMSEditor({storageKey, fields, renderItem, addLabel, emptyText}) {
  const { t } = useLang();
  const finalAddLabel = addLabel || t("cms_add_default");
  const finalEmptyText = emptyText || t("cms_empty_default");
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
    if (fields.some(f=>f.required && !vals[f.key])) { showToast(t("cms_required_fields"), "error"); return; }
    setSaving(true);
    const item = {id: Math.random().toString(36).slice(2), ...vals};
    const list = [item, ...items];
    const ok = await storageSet(storageKey, list, true);
    if (ok) { setItems(list); setVals({}); showToast(t("toast_content_added")); }
    else { showToast(t("toast_content_add_failed"), "error"); }
    setSaving(false);
  };
  const remove = async (id) => {
    const list = items.filter(i=>i.id!==id);
    setItems(list);
    await storageSet(storageKey, list, true);
    showToast(t("toast_content_removed"));
  };

  return (
    <div style={{marginTop:14}}>
      <Card>
        {fields.map(f=>(
          <input key={f.key} placeholder={f.label+(f.required?" *":"")} value={vals[f.key]||""} onChange={e=>setVals({...vals,[f.key]:e.target.value})}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        ))}
        <PrimaryButton onClick={add} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?t("cms_adding"):finalAddLabel}</PrimaryButton>
      </Card>
      <SectionTitle>{t("cms_shared_content", items.length)}</SectionTitle>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : items.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{finalEmptyText}</Card>
      ) : items.map(item=>(
        <Card key={item.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>{renderItem(item)}</div>
          <div onClick={()=>remove(item.id)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
        </Card>
      ))}
    </div>
  );
}

/* ============================================================
   TAKVİM — doktor randevuları, aşılar ve önemli tarihleri eklemek,
   düzenlemek ve silmek için kalıcı (Firestore) bir takvim.
   ============================================================ */
function getCalendarTypes(t) { return [
  {key:"doktor", label:t("calendar_type_doctor"), icon:Stethoscope, color:"pink"},
  {key:"asi", label:t("calendar_type_vaccine"), icon:Syringe, color:"blue"},
  {key:"vitamin", label:t("calendar_type_vitamin"), icon:Pill, color:"green"},
  {key:"diger", label:t("calendar_type_other"), icon:Star, color:"purple"}
]; }
function CalendarDetail({onBack}) {
  const { t, lang } = useLang();
  const CALENDAR_TYPES = getCalendarTypes(t);
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
      showToast(t("toast_calendar_added"));
    } else showToast(t("toast_add_failed"), "error");
    setSaving(false);
  };

  const removeEvent = (id) => persist(events.filter(e=>e.id!==id));

  const todayStr = todayISO();
  const upcoming = events.filter(e=>e.date >= todayStr);
  const past = events.filter(e=>e.date < todayStr);

  return (
    <Screen title={t("calendar_title")} onBack={onBack}>
      <PrimaryButton onClick={()=>setShowAdd(true)} style={{marginBottom:18,padding:14,fontSize:14}}>
        <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Plus size={16}/> {t("calendar_add_btn")}</span>
      </PrimaryButton>

      {loading ? (
        <><SkeletonCard/><SkeletonCard/></>
      ) : events.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("calendar_empty")}</Card>
      ) : (
        <>
          <SectionTitle>{t("calendar_upcoming")}</SectionTitle>
          {upcoming.length === 0 && <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("calendar_no_upcoming")}</Card>}
          {upcoming.map(ev=>{
            const meta = CALENDAR_TYPES.find(t=>t.key===ev.type) || CALENDAR_TYPES[3];
            return (
              <Card key={ev.id} className="abp-fade-up" style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <IconBadge icon={meta.icon} color={meta.color} size={40}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{ev.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{new Date(ev.date+"T00:00:00").toLocaleDateString(localeOf(lang),{day:"numeric",month:"long",year:"numeric"})} · {ev.time}</div>
                  {ev.note && <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:3}}>{ev.note}</div>}
                </div>
                <div onClick={()=>removeEvent(ev.id)} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
              </Card>
            );
          })}
          {past.length > 0 && (
            <>
              <SectionTitle>{t("calendar_past")}</SectionTitle>
              {past.slice().reverse().map(ev=>{
                const meta = CALENDAR_TYPES.find(t=>t.key===ev.type) || CALENDAR_TYPES[3];
                return (
                  <Card key={ev.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12,opacity:0.55}}>
                    <IconBadge icon={meta.icon} color={meta.color} size={34}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{ev.title}</div>
                      <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{new Date(ev.date+"T00:00:00").toLocaleDateString(localeOf(lang))} · {ev.time}</div>
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
        <Modal title={t("calendar_new_event_modal_title")} onClose={()=>setShowAdd(false)}>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10}} className="abp-scrollbar">
            {CALENDAR_TYPES.map(ct=><Pill_ key={ct.key} active={type===ct.key} onClick={()=>setType(ct.key)}>{ct.label}</Pill_>)}
          </div>
          <input placeholder={t("calendar_title_placeholder")} value={title} onChange={e=>setTitle(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          <div style={{display:"flex",gap:10}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)}
              style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
          </div>
          <input placeholder={t("calendar_note_placeholder")} value={note} onChange={e=>setNote(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={addEvent} disabled={!title.trim()||!date||saving} style={{padding:12,fontSize:13.5}}>{saving?t("calendar_saving"):t("calendar_add_to_calendar")}</PrimaryButton>
        </Modal>
      )}
    </Screen>
  );
}

function AdminPanel({onBack}) {
  const { t } = useLang();
  const ADMIN_TABS = [
    {key:"articles", label:t("admin_tab_articles")},
    {key:"activities", label:t("admin_tab_activities")},
    {key:"sounds", label:t("admin_tab_sounds")},
    {key:"lullabies", label:t("admin_tab_lullabies")}
  ];
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("articles");

  if (!unlocked) {
    return (
      <Screen title={t("admin_title")} onBack={onBack}>
        <Card>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{t("admin_login_title")}</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.6,marginBottom:14}}>{t("admin_login_desc")}</div>
          <input placeholder={t("admin_code_placeholder")} value={code} onChange={e=>setCode(e.target.value)} type="password"
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={()=>{ if(code==="0000"){ setUnlocked(true); showToast(t("toast_admin_login_ok")); } else { showToast(t("toast_admin_login_fail"),"error"); } }}>{t("admin_login_btn")}</PrimaryButton>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={t("admin_title")} onBack={onBack}>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {ADMIN_TABS.map(tb=><Pill_ key={tb.key} active={tab===tb.key} onClick={()=>setTab(tb.key)}>{tb.label}</Pill_>)}
      </div>

      {tab === "articles" && (
        <CMSEditor
          storageKey="cms:articles"
          addLabel={t("admin_add_article")}
          fields={[{key:"title",label:t("admin_field_title"),required:true},{key:"body",label:t("admin_field_body"),required:true}]}
          renderItem={(a)=>(<><div style={{fontWeight:700,fontSize:13.5}}>{a.title}</div><div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{a.body}</div></>)}
        />
      )}
      {tab === "activities" && (
        <CMSEditor
          storageKey="cms:activities"
          addLabel={t("admin_add_activity")}
          fields={[{key:"title",label:t("admin_field_title"),required:true},{key:"skill",label:t("admin_field_skill"),required:true},{key:"duration",label:t("admin_field_duration")},{key:"materials",label:t("admin_field_materials")}]}
          renderItem={(a)=>(<><div style={{fontWeight:700,fontSize:13.5}}>{a.title}</div><div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{a.skill}</div></>)}
        />
      )}
      {tab === "sounds" && (
        <CMSEditor
          storageKey="cms:sounds"
          addLabel={t("admin_add_sound")}
          fields={[{key:"name",label:t("admin_field_sound_name"),required:true}]}
          renderItem={(s)=>(<div style={{fontWeight:700,fontSize:13.5}}>{s.name}</div>)}
        />
      )}
      {tab === "lullabies" && (
        <CMSEditor
          storageKey="cms:lullabies"
          addLabel={t("admin_add_lullaby")}
          fields={[{key:"title",label:t("admin_field_title"),required:true},{key:"cat",label:t("admin_field_category")}]}
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
  const { t, lang } = useLang();
  const VACCINE_SCHEDULE_L = getVaccineSchedule(lang);
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
    showToast(t("toast_vaccine_marked_done"));
  };
  const unmark = async (i) => {
    const list = {...done};
    delete list[i];
    setDone(list);
    await storageSet(key, list, false);
    showToast(t("toast_vaccine_unmarked"));
  };

  const today = new Date();

  return (
    <div style={{marginTop:16}}>
      <SectionTitle>{t("vaccine_schedule_title")}</SectionTitle>
      <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>
        {t("vaccine_schedule_desc", child?.name||t("default_child_possessive"), new Date(birth).toLocaleDateString(localeOf(lang)))}
      </div>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : VACCINE_SCHEDULE_L.map((v,i)=>{
        const dueDate = addMonthsToDate(birth, v.ageMonths);
        const isDone = !!done[i];
        const isOverdue = !isDone && dueDate < today;
        const daysUntil = daysBetween(today, dueDate);
        const status = isDone ? t("vaccine_status_done") : isOverdue ? t("vaccine_status_overdue") : daysUntil<=14 ? t("vaccine_status_upcoming") : t("vaccine_status_planned");
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
  const { t, lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [dateVal, setDateVal] = useState(doneDate || todayISO());
  return (
    <Card style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:14}} onClick={()=>{ if(!isDone) setEditing(e=>!e); }} className="abp-tap">
        <IconBadge icon={isDone?Check:Syringe} color={isDone?"green":"blue"} size={38}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14}}>{v.name}</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{v.ageMonths===0?t("vaccine_at_birth"):t("vaccine_age_month", v.ageMonths)} · {t("vaccine_planned_label", formatDateTR(dueDate))}</div>
          {isDone && doneDate && <div style={{fontSize:11.5,color:"#5FAE7D",marginTop:2}}>{t("vaccine_done_label", new Date(doneDate).toLocaleDateString(localeOf(lang)))}</div>}
        </div>
        <div style={{fontSize:11.5,fontWeight:700,color:statusColor}}>{status}</div>
      </div>
      {isDone && (
        <div onClick={onUnmark} className="abp-tap" style={{fontSize:11.5,fontWeight:700,color:"var(--ink-faint)",marginTop:10,textAlign:"right"}}>{t("vaccine_undo")}</div>
      )}
      {!isDone && editing && (
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(150,130,180,0.15)",display:"flex",gap:8,alignItems:"center"}}>
          <input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)}
            style={{flex:1,padding:"10px 12px",borderRadius:12,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13,outline:"none"}}/>
          <div onClick={()=>{onMark(dateVal); setEditing(false);}} className="abp-tap" style={{padding:"10px 16px",borderRadius:12,background:"var(--ink)",color:"#fff",fontWeight:700,fontSize:12.5}}>{t("save")}</div>
        </div>
      )}
    </Card>
  );
}

function getWeaningReactions(t) { return [
  {key:"iyi", label:t("weaning_reaction_good"), color:"green"},
  {key:"begenmedi", label:t("weaning_reaction_dislike"), color:"blue"},
  {key:"hafif", label:t("weaning_reaction_mild"), color:"purple"},
  {key:"kacinilmali", label:t("weaning_reaction_avoid"), color:"pink"}
]; }

function WeaningCalendar({childId}) {
  const { t, lang } = useLang();
  const foods = getWeaningFoods(lang);
  const avoidFoods = getAvoidFoods(lang);
  const [day, setDay] = useState(1);
  const food = foods[(day-1) % foods.length];
  const gramMultiplier = day <= 10 ? 1 : day <= 20 ? 1.5 : 2;
  return (
    <div style={{marginTop:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div onClick={()=>setDay(d=>clamp(d-1,1,30))} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={16}/></div>
        <div style={{fontWeight:800}} className="abp-display">{t("weaning_calendar_day", day)}</div>
        <div onClick={()=>setDay(d=>clamp(d+1,1,30))} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={16}/></div>
      </div>
      <Card>
        <IconBadge icon={Utensils} color="green" size={44}/>
        <div style={{fontWeight:800,fontSize:16,marginTop:10}}>{food.name}</div>
        <div style={{fontSize:13,color:"var(--ink-soft)",marginTop:4}}>{t("weaning_amount_recommend", gramMultiplier, food.gram)}</div>
      </Card>
      <InfoBlock icon={BookOpen} color="blue" title={t("weaning_prep_title")} text={food.prep}/>
      <InfoBlock icon={AlertCircle} color="pink" title={t("weaning_allergy_title")} text={t("weaning_allergy_text")}/>
      <InfoBlock icon={Sparkles} color="purple" title={t("weaning_alt_title")} text={food.alt}/>
      <SectionTitle>{t("weaning_avoid_title")}</SectionTitle>
      <Card>
        {avoidFoods.map((f,i)=>(
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
  const { t, lang } = useLang();
  const WEANING_REACTIONS = getWeaningReactions(t);
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
    const entry = {food:name, amount:amount.trim(), reaction, note:note.trim(), date:new Date().toLocaleDateString(localeOf(lang)), time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...entries];
    const ok = await storageSet(key, list, false);
    if (ok) { setEntries(list); setFoodName(""); setAmount(""); setNote(""); setReaction("iyi"); showToast(t("toast_weaning_added")); }
    else showToast(t("toast_save_failed"), "error");
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = entries.filter(e=>e.ts!==ts);
    setEntries(list);
    await storageSet(key, list, false);
    showToast(t("toast_entry_removed"));
  };

  const watchList = entries.filter(e=>e.reaction==="hafif" || e.reaction==="kacinilmali");

  return (
    <div style={{marginTop:20}}>
      <SectionTitle>{t("weaning_log_title")}</SectionTitle>
      <Card>
        <input placeholder={t("weaning_food_placeholder", defaultFood || t("weaning_default_food_example"))} value={foodName} onChange={e=>setFoodName(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder={t("weaning_amount_placeholder")} value={amount} onChange={e=>setAmount(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <div style={{fontSize:12,color:"var(--ink-soft)",marginBottom:8}}>{t("weaning_reaction_label")}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {WEANING_REACTIONS.map(r=>(
            <div key={r.key} onClick={()=>setReaction(r.key)} className="abp-tap" style={{
              padding:"10px 6px",borderRadius:12,textAlign:"center",fontWeight:700,fontSize:12,
              background: reaction===r.key ? "var(--ink)" : `var(--${r.color})`,
              color: reaction===r.key ? "#fff" : "var(--ink)"
            }}>{r.label}</div>
          ))}
        </div>
        <input placeholder={t("field_note_placeholder")} value={note} onChange={e=>setNote(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <PrimaryButton onClick={add} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?t("calendar_saving"):t("weaning_add_to_log")}</PrimaryButton>
      </Card>

      {watchList.length > 0 && (
        <InfoBlock icon={AlertCircle} color="pink" highlight
          title={t("weaning_watchlist_title")}
          text={t("weaning_watchlist_text", watchList.map(w=>w.food).join(", "))}/>
      )}

      <SectionTitle>{t("history_title")}</SectionTitle>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : entries.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("weaning_history_empty")}</Card>
      ) : entries.slice(0,12).map(e=>{
        const r = WEANING_REACTIONS.find(x=>x.key===e.reaction) || {};
        return (
          <Card key={e.ts} style={{marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{fontWeight:700,fontSize:13.5}}>{e.food}</div>
                <div style={{fontSize:10.5,fontWeight:700,color:"var(--ink)",background:`var(--${r.color||"blue"})`,padding:"2px 8px",borderRadius:99}}>{r.label}</div>
              </div>
              {e.amount && <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:2}}>{t("weaning_amount_label", e.amount)}</div>}
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
  const { t, lang } = useLang();
  const AGE_GROUPS = [{key:"a1",label:t("age_group_1")},{key:"a2",label:t("age_group_2")},{key:"a3",label:t("age_group_3")}];
  const combos = getFoodComboSuggestions(lang);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [food, setFood] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ageFilter, setAgeFilter] = useState("a1");
  const key = `foodlog:${childId||"default"}`;

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const saved = await storageGet(key, false);
      setEntries(saved || []);
    } catch { setError(t("foodlog_error")); }
    setLoading(false);
  };
  useEffect(()=>{ load(); }, [childId]);

  const addEntry = async (text) => {
    const value = (text || food).trim();
    if (!value || saving) return;
    setSaving(true);
    const entry = {food:value, note:note.trim(), date:new Date().toLocaleDateString(localeOf(lang)), time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...entries];
    const ok = await storageSet(key, list, false);
    if (ok) { setEntries(list); setFood(""); setNote(""); showToast(t("toast_meal_saved")); }
    else showToast(t("toast_save_failed"), "error");
    setSaving(false);
  };
  const remove = async (ts) => {
    const list = entries.filter(e=>e.ts!==ts);
    setEntries(list);
    await storageSet(key, list, false);
    showToast(t("toast_entry_removed"));
  };

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Utensils} color="green" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>{t("foodlog_title")}</div>
        </div>
        <input placeholder={t("foodlog_placeholder")} value={food} onChange={e=>setFood(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <input placeholder={t("foodlog_note_placeholder")} value={note} onChange={e=>setNote(e.target.value)}
          style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:10}}/>
        <PrimaryButton onClick={()=>addEntry()} disabled={!food.trim()||saving} style={{padding:12,fontSize:14}}>{saving?t("calendar_saving"):t("foodlog_add_btn")}</PrimaryButton>
      </Card>

      <SectionTitle>{t("foodlog_history_title")}</SectionTitle>
      {error && <ErrorBanner text={error} onRetry={load}/>}
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : entries.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("foodlog_history_empty")}</Card>
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

      <SectionTitle>{t("foodlog_suggestions_title")}</SectionTitle>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:10}} className="abp-scrollbar">
        {AGE_GROUPS.map(a=> <Pill_ key={a.key} active={ageFilter===a.key} onClick={()=>setAgeFilter(a.key)}>{a.label}</Pill_>)}
      </div>
      {combos.filter(f=>f.age===ageFilter).map((f,i)=>(
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
  const { t, lang } = useLang();
  const TEETHING_ITEMS_L = getTeethingReliefItems(lang);
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
    const entry = {restless, date:new Date().toLocaleDateString(localeOf(lang)), time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...logs];
    const ok = await storageSet(key, list, false);
    if (ok) { setLogs(list); showToast(restless ? t("toast_teething_restless") : t("toast_teething_calm")); }
    else showToast(t("toast_save_failed"), "error");
    setSaving(false);
  };

  const latest = logs[0];
  const isRestless = latest ? latest.restless : null;
  const orderedKeys = isRestless === false ? TEETHING_CALM_TIP_ORDER : TEETHING_RESTLESS_TIP_ORDER;
  const orderedItems = orderedKeys
    .map(k=>TEETHING_ITEMS_L.find(it=>it.key===k))
    .filter(Boolean)
    .concat(TEETHING_ITEMS_L.filter(it=>!orderedKeys.includes(it.key)));

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <IconBadge icon={Smile} color="pink" size={36}/>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{t("teething_today_restless_title")}</div>
            <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{t("teething_today_restless_desc")}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div onClick={()=>logToday(true)} className="abp-tap" style={{flex:1,textAlign:"center",padding:"14px 0",borderRadius:14,background: isRestless===true?"var(--ink)":"var(--pink)",color: isRestless===true?"#fff":"var(--ink)",fontWeight:700,fontSize:13.5}}>{t("teething_yes_restless")}</div>
          <div onClick={()=>logToday(false)} className="abp-tap" style={{flex:1,textAlign:"center",padding:"14px 0",borderRadius:14,background: isRestless===false?"var(--ink)":"var(--green)",color: isRestless===false?"#fff":"var(--ink)",fontWeight:700,fontSize:13.5}}>{t("teething_no_calm")}</div>
        </div>
        {latest && (
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginTop:10,textAlign:"center"}}>{t("teething_last_log", latest.date, latest.time, latest.restless)}</div>
        )}
      </Card>

      {latest && (
        <InfoBlock
          icon={isRestless?AlertCircle:Check}
          color={isRestless?"pink":"green"}
          title={isRestless?t("teething_priority_title"):t("teething_calm_title")}
          text={isRestless ? t("teething_priority_text") : t("teething_calm_text")}
          highlight
        />
      )}

      <SectionTitle>{t("teething_relief_methods_title")}</SectionTitle>
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
      <div style={{fontSize:11.5,color:"var(--ink-faint)",margin:"10px 4px 0"}}>{t("teething_footer_note")}</div>
    </div>
  );
}

/* ============================================================
   KAKA TAKİBİ — kıvam takibi ve kabızlık önerileri
   ============================================================ */
function stoolReason(t, typeKey, days) {
  switch (typeKey) {
    case "sert":
      return days >= 2
        ? {text:t("poop_reason_sert_warn", days), severity:"warn"}
        : {text:t("poop_reason_sert_info"), severity:"info"};
    case "sulu":
      return days >= 2
        ? {text:t("poop_reason_sulu_warn", days), severity: days>=3?"urgent":"warn"}
        : {text:t("poop_reason_sulu_info"), severity:"info"};
    case "yesil":
      return days >= 3
        ? {text:t("poop_reason_yesil_warn", days), severity:"info"}
        : {text:t("poop_reason_yesil_info"), severity:"info"};
    case "mukuslu":
      return {text:t("poop_reason_mukuslu", days), severity: days>=2?"warn":"info"};
    case "kanli":
      return {text:t("poop_reason_kanli"), severity:"urgent"};
    default:
      return {text:t("poop_reason_default"), severity:"ok"};
  }
}
const STOOL_SEVERITY_STYLE = {
  urgent:{icon:AlertCircle, color:"pink"},
  warn:{icon:AlertCircle, color:"pink"},
  info:{icon:Info, color:"blue"},
  ok:{icon:Check, color:"green"}
};

function PoopTrackerSection({childId}) {
  const { t, lang } = useLang();
  const STOOL_TYPES_L = getStoolTypes(lang);
  const CONSTIPATION_TIPS_L = getConstipationTips(lang);
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
    const st = STOOL_TYPES_L.find(s=>s.key===pendingType);
    const entry = {type:pendingType, days:pendingDays, date:new Date().toLocaleDateString(localeOf(lang)), time:new Date().toLocaleTimeString(localeOf(lang),{hour:"2-digit",minute:"2-digit"}), ts:Date.now()};
    const list = [entry, ...logs];
    const ok = await storageSet(key, list, false);
    if (ok) { setLogs(list); showToast(t("toast_poop_saved", st.label, pendingDays), st.urgent?"error":"success"); setPendingType(null); setPendingDays(1); }
    else showToast(t("toast_save_failed"), "error");
    setSaving(false);
  };

  const latest = logs[0];
  const latestReason = latest ? stoolReason(t, latest.type, latest.days||1) : null;
  const showConstipationTips = latest && latest.type === "sert";

  return (
    <div style={{marginTop:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <IconBadge icon={Droplets} color="green" size={36}/>
          <div style={{fontWeight:700,fontSize:15}}>{t("poop_save_title")}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {STOOL_TYPES_L.map(s=>(
            <div key={s.key} onClick={()=>{setPendingType(s.key); setPendingDays(1);}} className="abp-tap" style={{
              padding:"12px 8px",borderRadius:14,fontWeight:700,fontSize:12.5,textAlign:"center",
              background: pendingType===s.key ? "var(--ink)" : `var(--${s.color})`,
              color: pendingType===s.key ? "#fff" : "var(--ink)"
            }}>{s.label}</div>
          ))}
        </div>

        {pendingType && (
          <div style={{marginTop:14,paddingTop:14,borderTop:"1px solid rgba(150,130,180,0.15)"}}>
            <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:8}}>{t("poop_days_question")}</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {[1,2,3,4,5].map(d=>(
                <div key={d} onClick={()=>setPendingDays(d)} className="abp-tap" style={{
                  flex:1,textAlign:"center",padding:"10px 0",borderRadius:12,fontWeight:700,fontSize:13,
                  background: pendingDays===d ? "var(--ink)" : "var(--bg)",
                  color: pendingDays===d ? "#fff" : "var(--ink-soft)"
                }}>{d===5?"5+":d}</div>
              ))}
            </div>
            <PrimaryButton onClick={confirmLog} disabled={saving} style={{padding:12,fontSize:13.5}}>{saving?t("calendar_saving"):t("save")}</PrimaryButton>
          </div>
        )}
      </Card>

      {latestReason && (
        <InfoBlock
          icon={STOOL_SEVERITY_STYLE[latestReason.severity].icon}
          color={STOOL_SEVERITY_STYLE[latestReason.severity].color}
          title={t("poop_reasons_title")}
          text={latestReason.text}
          highlight={latestReason.severity==="urgent"||latestReason.severity==="warn"}
        />
      )}

      {showConstipationTips && (
        <>
          <SectionTitle>{t("constipation_tips_title")}</SectionTitle>
          <Card>
            {CONSTIPATION_TIPS_L.map((ct,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",fontSize:13, borderTop: i>0 ? "1px solid rgba(150,130,180,0.12)" : "none"}}>
                <Info size={14} color="var(--ink-faint)" style={{marginTop:2,flexShrink:0}}/> {ct}
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionTitle>{t("history_title")}</SectionTitle>
      {loading ? (
        <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
      ) : logs.length === 0 ? (
        <Card style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13}}>{t("poop_history_empty")}</Card>
      ) : logs.slice(0,10).map((l)=>{
        const st = STOOL_TYPES_L.find(s=>s.key===l.type) || {};
        const r = stoolReason(t, l.type, l.days||1);
        return (
          <Card key={l.ts} style={{marginBottom:8,fontSize:13.5}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><strong>{st.label}</strong> <span style={{color:"var(--ink-faint)",fontSize:12}}>· {t("poop_days_ago", l.days||1)} · {l.date} {l.time}</span></div>
              {st.urgent && <span style={{fontSize:11,fontWeight:700,color:"#D98BA6"}}>{t("poop_consult_doctor")}</span>}
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
   ekleyip işaretleyip silebildiği kalıcı liste (Firestore).
   ============================================================ */
function ShoppingListSection() {
  const { t, lang } = useLang();
  const SHOPPING_L = getShoppingByAge(lang);
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
    if (ok) { setCustomItems(list); setInput(""); showToast(t("toast_list_added")); }
    else showToast(t("toast_add_failed"), "error");
    setSaving(false);
  };

  const removeCustomItem = async (id) => {
    const list = customItems.filter(i=>i.id!==id);
    setCustomItems(list);
    await storageSet("shopping:custom", list, false);
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;

  // Sepet: işaretlenmiş tüm ürünler (kendi listem + yaşa göre liste) tek bir
  // "sepetim" görünümünde toplanır; buradan kaldırmak (işareti geri almak)
  // ürünü sepetten atar ve alınacaklar listesine geri döner.
  const cartItems = [];
  customItems.forEach(it=>{
    const key = "custom:"+it.id;
    if (checked[key]) cartItems.push({key, label: it.text});
  });
  Object.entries(SHOPPING_L).forEach(([age, items])=>{
    items.forEach(it=>{
      const key = age+":"+it;
      if (checked[key]) cartItems.push({key, label: it});
    });
  });

  if (loading) {
    return <div style={{marginTop:16}}><SkeletonCard/><SkeletonCard/></div>;
  }

  return (
    <div style={{marginTop:16}}>
      <Card style={{marginBottom:12, background:"linear-gradient(135deg, #E8A9C4, #B79AEA)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:14,background:"rgba(255,255,255,0.28)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <ShoppingBag size={19} color="#fff"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:14.5,color:"#fff"}}>{t("shopping_cart_title")}</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,0.9)",marginTop:2}}>{t("shopping_checked_count", cartItems.length)}</div>
          </div>
        </div>
        {cartItems.length > 0 && (
          <div style={{marginTop:12,display:"flex",flexWrap:"wrap",gap:8}}>
            {cartItems.map(ci=>(
              <div key={ci.key} onClick={()=>toggleCheck(ci.key)} className="abp-tap" style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.22)",borderRadius:99,padding:"6px 10px 6px 12px"}}>
                <span style={{fontSize:12,fontWeight:700,color:"#fff",textDecoration:"line-through"}}>{ci.label}</span>
                <X size={12} color="#fff"/>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <div style={{fontWeight:800,fontSize:15,marginBottom:10}}>{t("shopping_own_list_title")}</div>
        <div style={{display:"flex",gap:8}}>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter" && addCustomItem()}
            placeholder={t("shopping_placeholder")}
            style={{flex:1,padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none"}}
          />
          <div onClick={addCustomItem} className="abp-tap" style={{width:44,height:44,borderRadius:14,background: input.trim()?"linear-gradient(135deg, #E8A9C4, #B79AEA)":"var(--ink-faint)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Plus size={18} color="#fff"/>
          </div>
        </div>
      </Card>

      {customItems.length > 0 && (
        <>
          <SectionTitle>{t("shopping_my_list", customItems.length)}</SectionTitle>
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

      <SectionTitle action={<div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{t("shopping_checked_count", totalChecked)}</div>}>{t("shopping_by_age_title")}</SectionTitle>
      {Object.entries(SHOPPING_L).map(([age,items])=>(
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
  const { t } = useLang();
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
          {place.address || t("place_no_address")}
        </div>
      </div>
      <div
        style={{textAlign:"right", flexShrink:0}}
        onClick={(e)=>{ e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`, "_blank"); }}
      >
        <div style={{fontSize:12.5, fontWeight:800, color:"var(--ink)"}}>
          {place.distanceKm < 1 ? `${Math.round(place.distanceKm*1000)} m` : `${place.distanceKm.toFixed(1)} km`}
        </div>
        <div style={{fontSize:10, color:"var(--ink-faint)"}}>{t("place_directions")}</div>
      </div>
    </Card>
  );
}

function NearbyTab() {
  const { t, lang } = useLang();
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

    // Eczaneler — 15km yarıçap (sonuç yoksa 25/40km'ye genişler). OSM'de
    // eczaneler hem amenity=pharmacy hem healthcare=pharmacy ile
    // etiketlenebildiği için ikisi birden sorgulanır. Overpass'ın kaçırdığı
    // (ör. eksik/farklı etiketlenmiş) eczaneleri de yakalamak için Nominatim
    // sonuçlarıyla birleştirilip aynı işletme iki kez görünmesin diye
    // tekilleştirilir — küçük ilçelerde OSM verisi tek başına eksik kalabiliyor.
    Promise.allSettled([
      overpassNearby(lat, lon, 15000, [["amenity","pharmacy"],["healthcare","pharmacy"]]),
      nominatimSearchNearby(lat, lon, 15000, "eczane")
    ]).then(([ov, nom]) => {
      if (ov.status==="rejected" && nom.status==="rejected") throw (ov.reason || nom.reason || new Error("pharmacy_error"));
      const combined = dedupePlaces([
        ...(ov.status==="fulfilled" ? ov.value : []),
        ...(nom.status==="fulfilled" ? nom.value : [])
      ]);
      const withDist = combined
        .map(p => ({...p, distanceKm: haversineKm(lat, lon, p.lat, p.lon)}))
        .filter(p => p.distanceKm <= 40) // "yakınımda" listesi 40km dışına taşmasın
        .sort((a,b)=>a.distanceKm-b.distanceKm).slice(0,20);
      setPharmacies(withDist);
    })
      .catch(()=>{ setPharmacies([]); setPharmError(true); })
      .finally(()=>setPharmLoading(false));

    // Bebek mağazaları — sadece shop=baby_goods (oyuncakçılar hariç
    // tutulur). 20km yarıçap, sonuç yoksa 30/45km'ye genişler; Overpass ve
    // Nominatim sonuçları birleştirilip tekilleştirilir.
    Promise.allSettled([
      overpassNearby(lat, lon, 20000, [["shop","baby_goods"]], [30000]),
      nominatimSearchNearby(lat, lon, 20000, "bebek mağazası")
    ]).then(([ov, nom]) => {
      if (ov.status==="rejected" && nom.status==="rejected") throw (ov.reason || nom.reason || new Error("baby_store_error"));
      const combined = dedupePlaces([
        ...(ov.status==="fulfilled" ? ov.value : []),
        ...(nom.status==="fulfilled" ? nom.value : [])
      ]);
      const withDist = combined
        .map(p => ({...p, distanceKm: haversineKm(lat, lon, p.lat, p.lon)}))
        .filter(p => p.distanceKm <= 30)
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
        const prev = coords;
        setCoords({lat:latitude, lon:longitude});
        setGeoStatus("ready");
        storageSet("nearby:lastCoords", {lat:latitude, lon:longitude, ts:Date.now()}, false);
        loadNearby(latitude, longitude);
        // Konum önemli ölçüde değiştiyse (örn. tatile gidildiyse) kullanıcıyı
        // bilgilendir; eczane/mağaza listeleri zaten yeni konuma göre yenilendi.
        if (prev) {
          const movedKm = haversineKm(prev.lat, prev.lon, latitude, longitude);
          if (movedKm > 5) showToast(t("nearby_location_changed"));
        }
      },
      (err) => {
        setGeoStatus(err.code===1 ? "denied" : "error");
        showToast(err.code===1 ? t("toast_location_denied") : t("toast_location_failed"), "error");
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
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
        <div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 4px"}}>{t("nearby_title")}</h2>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:14}}>{t("nearby_subtitle")}</div>
        </div>
        {coords && (
          <div onClick={requestLocation} className="abp-tap" style={{display:"flex",alignItems:"center",gap:5,flexShrink:0,padding:"7px 11px",borderRadius:99,background:"var(--card)",boxShadow:"var(--shadow-sm)",fontSize:11,fontWeight:700,color:"var(--ink-soft)"}}>
            {geoStatus==="loading" ? (
              <div className="abp-spin-slow" style={{width:11,height:11,borderRadius:"50%",border:"2px solid var(--ink-faint)",borderTopColor:"var(--ink)"}}/>
            ) : <MapPin size={12}/>}
            {t("nearby_refresh_location")}
          </div>
        )}
      </div>

      {geoStatus!=="ready" && (
        <Card style={{marginBottom:14, textAlign:"center", padding:"26px 18px"}}>
          <div style={{width:56,height:56,borderRadius:20,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <MapPin size={26} color="var(--ink)"/>
          </div>
          <div style={{fontWeight:700, fontSize:14.5, marginBottom:6}}>
            {geoStatus==="denied" ? t("nearby_denied") :
             geoStatus==="unsupported" ? t("nearby_unsupported") :
             geoStatus==="error" ? t("nearby_error") :
             t("nearby_idle_title")}
          </div>
          <div style={{fontSize:12, color:"var(--ink-soft)", marginBottom:14, lineHeight:1.5}}>
            {geoStatus==="denied"
              ? t("nearby_denied_desc")
              : t("nearby_idle_desc")}
          </div>
          <PrimaryButton onClick={requestLocation} style={{maxWidth:220,margin:"0 auto"}}>
            {geoStatus==="loading" ? t("nearby_locating") : t("nearby_find_btn")}
          </PrimaryButton>
        </Card>
      )}

      {coords && (
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <Pill_ active={category==="pharmacy"} onClick={()=>{ setCategory("pharmacy"); setSelectedPlace(null); }}>
            {t("nearby_pharmacies")}
          </Pill_>
          <Pill_ active={category==="baby"} onClick={()=>{ setCategory("baby"); setSelectedPlace(null); }}>
            {t("nearby_baby_stores")}
          </Pill_>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:10}}>
        <Pill_ active={mapView==="country"} onClick={()=>{ setMapView("country"); setSelectedPlace(null); }}>{t("nearby_country")}</Pill_>
        {coords && <Pill_ active={mapView==="local"} onClick={()=>setMapView("local")}>{t("nearby_local_area")}</Pill_>}
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
            : `${district ? district+", " : ""}${province || t("nearby_location_found")}`}
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
                <div style={{fontWeight:800,fontSize:14.5,color:"#fff"}}>{t("nearby_duty_pharmacy_title")}</div>
                <div style={{fontSize:11.5,color:"rgba(255,255,255,0.9)",marginTop:2}}>
                  {province ? t("nearby_duty_pharmacy_desc", `${province}${district?" · "+district:""}`) : t("nearby_duty_pharmacy_desc_default")}
                </div>
              </div>
              <ArrowRight size={18} color="#fff"/>
            </div>
          </Card>

          <SectionTitle>{t("nearby_closest_pharmacies")}</SectionTitle>
          {pharmLoading && (
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--ink-soft)",fontSize:12.5,marginBottom:8}}>
              <div className="abp-spin-slow" style={{width:14,height:14,borderRadius:"50%",border:"2px solid var(--ink-faint)",borderTopColor:"var(--ink)"}}/>
              {t("nearby_searching_pharmacies")}
            </div>
          )}
          {!pharmLoading && pharmError && (
            <Card style={{textAlign:"center"}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:10}}>{t("nearby_pharmacy_load_error")}</div>
              <PrimaryButton style={{maxWidth:180,margin:"0 auto",padding:10,fontSize:12.5}} onClick={()=>loadNearby(coords.lat, coords.lon)}>{t("nearby_retry")}</PrimaryButton>
            </Card>
          )}
          {!pharmLoading && !pharmError && pharmacies.length===0 && (
            <Card
              style={{textAlign:"center"}}
              onClick={()=>window.open(`https://www.google.com/maps/search/eczane/@${coords.lat},${coords.lon},14z`, "_blank")}
            >
              <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{t("nearby_no_pharmacies")}</div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",marginTop:6}}>{t("nearby_search_google_maps")}</div>
            </Card>
          )}
          {pharmacies.map(p => (
            <PlaceCard
              key={p.id} place={p} color="purple" icon={Pill}
              active={selectedPlace?.id===p.id}
              onSelect={(pl)=>{ setSelectedPlace(pl); setMapView("local"); }}
            />
          ))}
          {!pharmLoading && !pharmError && pharmacies.length>0 && (
            <div
              className="abp-tap"
              onClick={()=>window.open(`https://www.google.com/maps/search/eczane/@${coords.lat},${coords.lon},14z`, "_blank")}
              style={{textAlign:"center",fontSize:12,fontWeight:700,color:"var(--ink-soft)",padding:"10px 0 4px"}}
            >
              {t("nearby_search_google_maps")}
            </div>
          )}
        </>
      )}

      {coords && category==="baby" && (
        <>
          <SectionTitle>{t("nearby_closest_baby_stores")}</SectionTitle>
          {babyLoading && (
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--ink-soft)",fontSize:12.5,marginBottom:8}}>
              <div className="abp-spin-slow" style={{width:14,height:14,borderRadius:"50%",border:"2px solid var(--ink-faint)",borderTopColor:"var(--ink)"}}/>
              {t("nearby_searching_baby_stores")}
            </div>
          )}
          {!babyLoading && babyError && (
            <Card style={{textAlign:"center"}}>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:10}}>{t("nearby_baby_store_load_error")}</div>
              <PrimaryButton style={{maxWidth:180,margin:"0 auto",padding:10,fontSize:12.5}} onClick={()=>loadNearby(coords.lat, coords.lon)}>{t("nearby_retry")}</PrimaryButton>
            </Card>
          )}
          {!babyLoading && !babyError && babyStores.length===0 && (
            <Card
              style={{textAlign:"center"}}
              onClick={()=>window.open(`https://www.google.com/maps/search/bebek+mağazası/@${coords.lat},${coords.lon},14z`, "_blank")}
            >
              <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{t("nearby_no_baby_stores")}</div>
              <div style={{fontSize:12,fontWeight:700,color:"var(--ink)",marginTop:6}}>{t("nearby_search_google_maps")}</div>
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

const DIET_DAILY_GOALS = [
  {key:"su", label:"2-2.5L su içtim"},
  {key:"protein", label:"Yeterli protein aldım"},
  {key:"sebzemeyve", label:"Sebze/meyve tükettim"},
  {key:"vitamin", label:"Vitamin/takviyemi aldım"}
];

// Anne diyeti haftalık programı: anne istediği zaman "0"dan başlayabilir,
// programı sıfırlayabilir; her gün için günlük hedefler işaretlenir ve
// hafta numarası başlangıç tarihine göre otomatik hesaplanır.
function MomDietWeeklyTracker() {
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null); // {startDate, days: {"YYYY-MM-DD": {su:true,...}}}

  const load = async () => {
    setLoading(true);
    const saved = await storageGet("diet:weeklyProgram", false);
    setProgram(saved || null);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const startProgram = async () => {
    const fresh = {startDate: todayISO(), days:{}};
    setProgram(fresh);
    await storageSet("diet:weeklyProgram", fresh, false);
    showToast("Diyet programı 0. günden başlatıldı ✓");
  };

  const resetProgram = async () => {
    await startProgram();
  };

  const toggleGoal = async (dateKey, goalKey) => {
    const days = {...(program.days||{})};
    const dayVals = {...(days[dateKey]||{})};
    dayVals[goalKey] = !dayVals[goalKey];
    days[dateKey] = dayVals;
    const next = {...program, days};
    setProgram(next);
    await storageSet("diet:weeklyProgram", next, false);
  };

  if (loading) return <SkeletonCard/>;

  if (!program) {
    return (
      <Card style={{textAlign:"center", padding:"22px 16px"}}>
        <div style={{width:52,height:52,borderRadius:20,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
          <Utensils size={22}/>
        </div>
        <div style={{fontWeight:800,fontSize:14.5,marginBottom:6}}>Haftalık Anne Diyeti Programı</div>
        <div style={{fontSize:12,color:"var(--ink-soft)",marginBottom:14,lineHeight:1.5}}>Hazır olduğunuzda programı 0. günden başlatabilirsiniz. İstediğiniz zaman sıfırlayıp yeniden başlayabilirsiniz.</div>
        <PrimaryButton onClick={startProgram} style={{maxWidth:220,margin:"0 auto"}}>Programı Başlat (0. Gün)</PrimaryButton>
      </Card>
    );
  }

  const start = new Date(program.startDate);
  const totalDays = Math.max(0, daysBetween(start, new Date()));
  const weekNumber = Math.floor(totalDays/7) + 1;
  const dayOfWeek = (totalDays % 7) + 1; // 1..7

  // Bu haftanın 7 günü (Pazartesi mantığı değil, programın başladığı güne göre)
  const weekStartOffset = Math.floor(totalDays/7) * 7;
  const weekDates = Array.from({length:7}, (_,i)=>{
    const d = new Date(start);
    d.setDate(d.getDate() + weekStartOffset + i);
    return d;
  });

  return (
    <Card>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div>
          <div style={{fontWeight:800,fontSize:15}}>Hafta {weekNumber}</div>
          <div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{dayOfWeek}. gün · Program {formatDateTR(start)} tarihinde başladı</div>
        </div>
        <div onClick={resetProgram} className="abp-tap" style={{fontSize:11,fontWeight:700,color:"var(--ink-faint)",border:"1px solid rgba(150,130,180,0.25)",borderRadius:99,padding:"6px 12px"}}>0'la Başlat</div>
      </div>
      <div style={{marginTop:12}}>
        {weekDates.map((d,i)=>{
          const dateKey = d.toISOString().slice(0,10);
          const isFuture = d > new Date();
          const dayVals = (program.days||{})[dateKey] || {};
          const doneCount = DIET_DAILY_GOALS.filter(g=>dayVals[g.key]).length;
          return (
            <div key={dateKey} style={{padding:"9px 0",borderBottom: i<6?"1px solid rgba(150,130,180,0.12)":"none", opacity:isFuture?0.4:1}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <div style={{fontWeight:700,fontSize:12.5}}>{d.toLocaleDateString("tr-TR",{weekday:"short", day:"2-digit", month:"short"})}</div>
                <div style={{fontSize:11,color:"var(--ink-faint)"}}>{doneCount}/{DIET_DAILY_GOALS.length}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {DIET_DAILY_GOALS.map(g=>{
                  const on = !!dayVals[g.key];
                  return (
                    <div key={g.key} onClick={()=>!isFuture && toggleGoal(dateKey, g.key)} className="abp-tap"
                      style={{display:"flex",alignItems:"center",gap:5,padding:"5px 9px",borderRadius:99,background: on?"var(--pink)":"var(--bg)",fontSize:10.5,fontWeight:700, cursor:isFuture?"default":"pointer"}}>
                      {on && <Check size={10}/>} {g.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ActivitiesTab({child}) {
  const { t, lang } = useLang();
  const [section, setSection] = useState("gunluk");
  const [emzirmeCount, setEmzirmeCount] = useState(0);
  const [memoryEntries, setMemoryEntries] = useState([]);
  const [badgeLoading, setBadgeLoading] = useState(true);
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
  const TIMER_OPTIONS = getTimerOptions(t);

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

  useEffect(()=>{
    if (section !== "rozet") return;
    let alive = true;
    setBadgeLoading(true);
    (async ()=>{
      const [emzStat, memories] = await Promise.all([
        storageGet("stats:emzirmeCount", false),
        storageGet("memories:entries", false)
      ]);
      if (!alive) return;
      setEmzirmeCount((emzStat && emzStat.count) || 0);
      setMemoryEntries(memories || []);
      setBadgeLoading(false);
    })();
    return ()=>{ alive = false; };
  }, [section]);

  const badgeCtx = useMemo(()=>{
    const memoryTitles = new Set(memoryEntries.map(m=>m.type));
    let ageMonths = null;
    if (child && child.status !== "pregnant" && child.birth) {
      ageMonths = childAgeInfo(child.birth).months;
    }
    return {
      emzirmeCount,
      memoryCount: memoryEntries.length,
      hasMemory: (typeName)=>memoryTitles.has(typeName),
      ageMonths
    };
  }, [emzirmeCount, memoryEntries, child]);

  const allActivities = [...ACTIVITIES_POOL, ...cmsActivities];
  const allSounds = [...SLEEP_SOUNDS, ...cmsSounds];
  const allLullabies = [...LULLABIES_POOL, ...cmsLullabies];

  const sections = [
    {key:"gunluk", label:t("activities_section_daily")},
    {key:"elisi", label:t("activities_section_craft")},
    {key:"hikaye", label:t("activities_section_story")},
    {key:"ninni", label:t("activities_section_lullaby")},
    {key:"uykusesi", label:t("activities_section_sound")},
    {key:"annediyeti", label:t("activities_section_diet")},
    {key:"annesagligi", label:t("activities_section_health")},
    {key:"alisveris", label:t("activities_section_shopping")},
    {key:"ani", label:t("activities_section_memory")},
    {key:"rozet", label:t("activities_section_badge")}
  ];

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>{t("activities_title")}</h2>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}} className="abp-scrollbar">
        {sections.map(s => <Pill_ key={s.key} active={section===s.key} onClick={()=>setSection(s.key)}>{s.label}</Pill_>)}
      </div>

      {section === "gunluk" && (
        <div style={{marginTop:16}}>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10}} className="abp-scrollbar">
            {[
              {value:"Tümü", label:t("age_all")},
              {value:"0-6 ay", label:t("age_filter_0_6")},
              {value:"6-12 ay", label:t("age_filter_6_12")},
              {value:"12-24 ay", label:t("age_filter_12_24")},
              {value:"2-3 yaş", label:t("age_filter_2_3y")},
              {value:"3+ yaş", label:t("age_filter_3plus")}
            ].map(a=>(
              <Pill_ key={a.value} active={ageFilter===a.value} onClick={()=>setAgeFilter(a.value)}>{a.label}</Pill_>
            ))}
          </div>
          {cmsLoading && <SkeletonCard/>}
          {allActivities.filter(a=>ageFilter==="Tümü"||!a.age||a.age===ageFilter).map((a,i)=>(
            <Card key={i} className="abp-fade-up" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{fontWeight:700,fontSize:14.5}}>{a.title}</div>
                {a.age && <span style={{fontSize:10.5,fontWeight:700,color:"var(--ink-soft)",background:"var(--bg)",padding:"3px 8px",borderRadius:99}}>{a.age}</span>}
              </div>
              <div style={{fontSize:12.5,color:"var(--ink-soft)",marginTop:4}}>{t("activities_skill_label", a.skill)}</div>
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
              <div style={{fontSize:11,color:"var(--ink-faint)",marginTop:6,display:"flex",alignItems:"center",gap:4}}><Info size={11}/> {t("craft_how_to")}</div>
            </Card>
          ))}
        </div>
      )}

      {selectedCraft && (
        <Modal title={selectedCraft.title} onClose={()=>setSelectedCraft(null)}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink-faint)",marginBottom:10}}>{selectedCraft.cat} · {selectedCraft.age} yaş</div>
          <InfoBlock icon={ShoppingBag} color="blue" title={t("craft_materials_title")} text={selectedCraft.materials}/>
          <SectionTitle>{t("craft_steps_title")}</SectionTitle>
          <Card>
            {selectedCraft.steps.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom: i<selectedCraft.steps.length-1?"1px solid rgba(150,130,180,0.12)":"none"}}>
                <div style={{width:22,height:22,borderRadius:11,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </Card>
          {selectedCraft.tip && <InfoBlock icon={Sparkles} color="purple" title={t("craft_dev_tip_title")} text={selectedCraft.tip}/>}
        </Modal>
      )}

      {section === "hikaye" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>{t("story_listen_note")}</div>
          {STORIES_POOL.map((s,i)=>{
            const isSpeaking = speakingStory === s.title;
            return (
              <Card key={i} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                <div onClick={()=>toggleStory(s)} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: isSpeaking?"var(--purple)":"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isSpeaking ? <Pause size={16}/> : <Play size={16}/>}
                </div>
                <div style={{flex:1}} onClick={()=>setFavs(f=>f.includes(s.title)?f.filter(x=>x!==s.title):[...f,s.title])}>
                  <div style={{fontWeight:700,fontSize:14}}>{s.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)"}}>{s.cat} · {s.dur}{isSpeaking?t("story_reading_now"):""}</div>
                </div>
                <Star size={18} fill={favs.includes(s.title)?"#F0A8C6":"none"} color="#F0A8C6" onClick={()=>setFavs(f=>f.includes(s.title)?f.filter(x=>x!==s.title):[...f,s.title])}/>
              </Card>
            );
          })}
        </div>
      )}

      {section === "ninni" && (
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:10}}>{t("lullaby_listen_note")}</div>
          {allLullabies.map((l,i)=>{
            const isSpeaking = speakingLullaby === l.title;
            return (
              <Card key={i} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}} onClick={()=>toggleLullaby(l)}>
                <div style={{width:38,height:38,borderRadius:19,background: isSpeaking?"var(--blue-deep)":"var(--blue)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {isSpeaking ? <Pause size={16}/> : <Play size={16}/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14}}>{l.title}</div>
                  <div style={{fontSize:12,color:"var(--ink-soft)"}}>{l.cat}{isSpeaking?t("lullaby_playing_now"):""}</div>
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
              <div style={{fontWeight:700,marginBottom:10}}>{t("sound_now_playing", playing)}</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                {TIMER_OPTIONS.map(opt=>(
                  <Pill_ key={opt.key} active={timer===opt.ms} onClick={()=>{ setTimer(opt.ms); scheduleSleepSoundAutoStop(opt.ms, ()=>setPlaying(null)); }}>{opt.label}</Pill_>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {section === "annediyeti" && (
        <div style={{marginTop:16}}>
          <MomDietWeeklyTracker/>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",margin:"18px 0 12px",lineHeight:1.6}}>Aşağıdaki plan genel bir örnektir; emzirme, hamilelik veya özel sağlık durumunuza göre doktorunuz/diyetisyeninizle birlikte kişiselleştirilmesi önerilir.</div>
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
        <div style={{marginTop:16}}>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",marginBottom:12,lineHeight:1.6}}>Rozetler, uygulamada gerçekten yaptığınız kayıtlara (emzirme, anı günlüğü, çocuğunuzun yaşı) göre otomatik olarak açılır.</div>
          {badgeLoading ? (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><SkeletonCard/><SkeletonCard/></div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {BADGES.map((b,i)=>{
                const Icon = b.icon;
                const result = b.check(badgeCtx);
                const earned = !!result.earned;
                const pct = result.target ? clamp(Math.round((result.current/result.target)*100),0,100) : (earned?100:0);
                return (
                  <Card key={i} style={{textAlign:"center", opacity: earned?1:0.7}}>
                    <div style={{width:52,height:52,borderRadius:26,background: earned?"var(--pink)":"var(--purple)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px"}}>
                      {earned ? <Icon size={22}/> : <Lock size={18}/>}
                    </div>
                    <div style={{fontWeight:700,fontSize:12.5,marginBottom:6}}>{b.title}</div>
                    {!earned && (
                      <>
                        <div style={{height:5,borderRadius:99,background:"var(--bg)",overflow:"hidden",margin:"0 auto 4px"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"var(--ink-faint)",borderRadius:99}}/>
                        </div>
                        <div style={{fontSize:10.5,color:"var(--ink-faint)"}}>{result.current}/{result.target}</div>
                      </>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MEMORY_TYPES = ["İlk Gülümseme","İlk Diş","İlk Adım","İlk Kelime","İlk Emekleme","İlk Banyo","İlk Saç Kesimi","İlk Okul Günü","Diğer"];

// Seçilen bir fotoğrafı, storage limitlerini aşmamak için makul bir boyuta
// küçültüp base64 (data URL) olarak döndürür.
function resizeImageFile(file, maxSize=640, quality=0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = Math.round(height * (maxSize/width)); width = maxSize; }
        else if (height > maxSize) { width = Math.round(width * (maxSize/height)); height = maxSize; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function MemoryJournal() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  const [type, setType] = useState(MEMORY_TYPES[0]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [galleryPermission, setGalleryPermission] = useState(null); // null=henüz sorulmadı, true/false
  const [askPermission, setAskPermission] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true); setError(null);
    const [saved, perm] = await Promise.all([
      storageGet("memories:entries", false),
      storageGet("memories:galleryPermission", false)
    ]);
    if (saved) setEntries(saved);
    else if (saved === null) setEntries([]);
    if (perm && typeof perm.granted === "boolean") setGalleryPermission(perm.granted);
    setLoading(false);
  };
  useEffect(()=>{ load(); }, []);

  const openGallery = () => {
    if (galleryPermission === true) { fileInputRef.current?.click(); return; }
    setAskPermission(true);
  };

  const grantPermission = async () => {
    setAskPermission(false);
    setGalleryPermission(true);
    await storageSet("memories:galleryPermission", {granted:true, ts:Date.now()}, false);
    // İzin verildikten sonra galeri seçiciyi hemen aç; tarayıcı/işletim
    // sistemi kendi galeri erişim iznini burada ayrıca soracaktır.
    setTimeout(()=>fileInputRef.current?.click(), 50);
  };

  const declinePermission = async () => {
    setAskPermission(false);
    setGalleryPermission(false);
    await storageSet("memories:galleryPermission", {granted:false, ts:Date.now()}, false);
    showToast("Galeri izni verilmedi, fotoğrafsız devam edebilirsiniz");
  };

  const onFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Lütfen bir fotoğraf seçin", "error"); return; }
    setPhotoBusy(true);
    try {
      const dataUrl = await resizeImageFile(file);
      setPhotoUrl(dataUrl);
    } catch {
      showToast("Fotoğraf yüklenemedi, tekrar deneyin", "error");
    }
    setPhotoBusy(false);
  };

  const save = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    const entry = {title:text.trim(), type, photoUrl:photoUrl||null, date:new Date().toLocaleDateString("tr-TR"), ts:Date.now()};
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

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={onFileChosen} style={{display:"none"}}/>

        {photoUrl ? (
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <img src={photoUrl} alt="" style={{width:52,height:52,borderRadius:14,objectFit:"cover",flexShrink:0}}/>
            <div style={{flex:1,fontSize:12,color:"var(--ink-soft)"}}>Fotoğraf eklendi</div>
            <div onClick={()=>setPhotoUrl("")} className="abp-tap" style={{width:28,height:28,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color="var(--ink-faint)"/></div>
          </div>
        ) : (
          <div onClick={openGallery} className="abp-tap" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"12px 0",borderRadius:14,border:"1.5px dashed rgba(150,130,180,0.35)",marginBottom:10,color:"var(--ink-soft)",fontSize:13,fontWeight:700}}>
            <Camera size={16}/> {photoBusy ? "Yükleniyor..." : "Galeriden Fotoğraf Ekle"}
          </div>
        )}

        <PrimaryButton onClick={save} disabled={!text.trim()||saving} style={{padding:12,fontSize:13.5}}>{saving?"Kaydediliyor...":"Kaydet"}</PrimaryButton>
      </Card>

      {askPermission && (
        <Modal title="Galeri Erişim İzni" onClose={declinePermission}>
          <div style={{textAlign:"center",padding:"6px 0 4px"}}>
            <div style={{width:56,height:56,borderRadius:20,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
              <Camera size={24} color="var(--ink)"/>
            </div>
            <div style={{fontSize:13.5,lineHeight:1.6,color:"var(--ink-soft)",marginBottom:18}}>
              Anı Günlüğüne fotoğraf ekleyebilmek için galerinize erişim izni istiyoruz. Fotoğraflarınız yalnızca sizin cihazınızda/hesabınızda saklanır.
            </div>
            <PrimaryButton onClick={grantPermission} style={{marginBottom:10}}>İzin Ver</PrimaryButton>
            <div onClick={declinePermission} className="abp-tap" style={{textAlign:"center",fontSize:13,color:"var(--ink-faint)",fontWeight:700,padding:8}}>Şimdi Değil</div>
          </div>
        </Modal>
      )}

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
const ASSISTANT_SYSTEM_PROMPT_TR = "Sen bir Anne & Bebek uygulamasındaki yardımcı asistansın. Türkçe konuşuyorsun. Hamilelik, bebek bakımı, uyku, beslenme ve çocuk gelişimi hakkında sıcak, kısa ve anlaşılır bilgi veriyorsun. KESİNLİKLE tanı koymuyorsun, ilaç veya doz önermiyorsun. Ateş, kanama, şiddetli ağrı, nefes darlığı gibi riskli/acil belirtilerde mutlaka ve açıkça bir sağlık profesyoneline veya acil servise başvurmasını söylüyorsun. Yanıtların 3-5 cümleyi geçmesin.";
const ASSISTANT_SYSTEM_PROMPT_EN = "You are a helpful assistant in a Mom & Baby app. You speak English. You give warm, brief and clear information about pregnancy, baby care, sleep, nutrition and child development. You NEVER diagnose or recommend medication or dosages. For risky/urgent symptoms like fever, bleeding, severe pain, or shortness of breath, you always and clearly tell the person to consult a healthcare professional or emergency services. Keep your answers to 3-5 sentences.";
const ASSISTANT_SYSTEM_PROMPT_DE = "Du bist ein hilfreicher Assistent in einer Mama-&-Baby-App. Du sprichst Deutsch. Du gibst warme, kurze und verständliche Informationen zu Schwangerschaft, Babypflege, Schlaf, Ernährung und kindlicher Entwicklung. Du stellst NIEMALS eine Diagnose und empfiehlst keine Medikamente oder Dosierungen. Bei riskanten/dringenden Symptomen wie Fieber, Blutungen, starken Schmerzen oder Atemnot sagst du immer und deutlich, dass die Person eine medizinische Fachkraft oder den Notdienst aufsuchen soll. Halte deine Antworten auf 3-5 Sätze.";
const ASSISTANT_SYSTEM_PROMPT_BY_LANG = { tr: ASSISTANT_SYSTEM_PROMPT_TR, en: ASSISTANT_SYSTEM_PROMPT_EN, de: ASSISTANT_SYSTEM_PROMPT_DE };
function getAssistantSystemPrompt(lang) { return ASSISTANT_SYSTEM_PROMPT_BY_LANG[lang] || ASSISTANT_SYSTEM_PROMPT_TR; }
const ASSISTANT_SYSTEM_PROMPT = ASSISTANT_SYSTEM_PROMPT_TR;

const ASSISTANT_SUGGESTIONS_TR = ["Bebeğim 8 aylık, muz verebilir miyim?","Gece sürekli ağlıyor, ne yapabilirim?","Bu hafta nelere dikkat etmeliyim?"];
const ASSISTANT_SUGGESTIONS_EN = ["My baby is 8 months old, can I give bananas?","She keeps crying at night, what can I do?","What should I watch out for this week?"];
const ASSISTANT_SUGGESTIONS_DE = ["Mein Baby ist 8 Monate alt, darf ich Banane geben?","Es weint nachts ständig, was kann ich tun?","Worauf sollte ich diese Woche achten?"];
const ASSISTANT_SUGGESTIONS_BY_LANG = { tr: ASSISTANT_SUGGESTIONS_TR, en: ASSISTANT_SUGGESTIONS_EN, de: ASSISTANT_SUGGESTIONS_DE };
function getAssistantSuggestions(lang) { return ASSISTANT_SUGGESTIONS_BY_LANG[lang] || ASSISTANT_SUGGESTIONS_TR; }
const ASSISTANT_SUGGESTIONS = ASSISTANT_SUGGESTIONS_TR;

function newConversation(t) {
  const tt = t || ((k)=>({new_chat:"Yeni Sohbet", greeting:"Merhaba! Ben Anne Asistanınız 🤍 Hamilelik, bebek bakımı veya gelişimle ilgili merak ettiklerinizi sorabilirsiniz. Acil durumlarda lütfen doktorunuza başvurun."}[k]));
  return {
    id: Math.random().toString(36).slice(2),
    title: tt("new_chat"),
    messages: [{role:"bot", text:tt("greeting")}],
    updatedAt: Date.now()
  };
}

/* ============================================================
   ANNE SOHBETİ — bu artifact'ı kullanan tüm anneler arasında
   paylaşımlı bir sohbet alanı (Firestore, shared/{key}).
   Not: Gerçek zamanlı değil, birkaç saniyede bir yenilenir (polling).
   Gönderdiğiniz mesajlar bu artifact'ı açan HERKES tarafından görülebilir.
   ============================================================ */
function CommunityChat() {
  const { t, lang } = useLang();
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

  const prevLenRef = useRef(0);
  useEffect(()=>{
    const el = scrollRef.current;
    if (!el) return;
    const wasNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    const grew = messages.length > prevLenRef.current;
    // Sadece yeni mesaj geldiyse VE kullanıcı zaten en altta okuyorsa (ya da
    // ilk yükleme ise) otomatik en alta kaydır. Aksi halde, biri eski
    // mesajları okumak için yukarı kaydırmışken 4 saniyede bir gelen
    // arka plan güncellemesi görünümü aşağı zorlamasın.
    if (grew && (wasNearBottom || prevLenRef.current === 0)) {
      el.scrollTop = el.scrollHeight;
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  const saveNickname = async () => {
    if (!nickInput.trim()) return;
    const val = {name: nickInput.trim().slice(0,24)};
    await storageSet("profile:nickname", val, false);
    setNickname(val.name);
    showToast(t("toast_nickname_saved"));
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const msg = {id: Math.random().toString(36).slice(2), name: nickname, text: input.trim().slice(0,500), ts: Date.now()};
    const latest = await storageGet("community:messages", true) || [];
    const list = [...latest, msg].slice(-200);
    const ok = await storageSet("community:messages", list, true);
    if (ok) { setMessages(list); setInput(""); }
    else showToast(t("toast_message_send_failed"), "error");
    setSending(false);
  };

  // Tüm paylaşılan mesajları kalıcı olarak siler (herkes için — bu veri
  // shared=true ile saklanıyor). Geri alınamaz olduğu için önce onay istenir.
  const clearAllMessages = async () => {
    if (!window.confirm(t("community_clear_confirm"))) return;
    const ok = await storageSet("community:messages", [], true);
    if (ok) { setMessages([]); showToast(t("toast_community_cleared")); }
    else showToast(t("toast_message_send_failed"), "error");
  };

  if (loadingNick) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>{t("community_title")}</h2>
        <SkeletonCard lines={1}/>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px 20px 110px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 6px"}}>{t("community_title")}</h2>
        <div style={{fontSize:12.5,color:"var(--ink-soft)",marginBottom:16,lineHeight:1.6}}>{t("community_intro")}</div>
        <Card>
          <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>{t("community_pick_nickname")}</div>
          <input placeholder={t("community_nickname_placeholder")} value={nickInput} onChange={e=>setNickInput(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:14,border:"1px solid rgba(150,130,180,0.18)",background:"var(--bg)",fontSize:13.5,outline:"none",marginBottom:12}}/>
          <PrimaryButton onClick={saveNickname} disabled={!nickInput.trim()}>{t("community_join_btn")}</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div style={{padding:"20px 20px 10px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:0}}>{t("community_title")}</h2>
          <div style={{fontSize:12,color:"var(--ink-soft)",marginTop:4}}>{t("community_writing_as", nickname)}</div>
        </div>
        {messages.length > 0 && (
          <div onClick={clearAllMessages} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)",flexShrink:0,marginTop:2}}>
            <X size={15} color="var(--ink-faint)"/>
          </div>
        )}
      </div>
      <div ref={scrollRef} style={{flex:"1 1 0%",minHeight:0,overflowY:"auto",padding:"6px 16px 150px"}} className="abp-scrollbar">
        {loading ? (
          <><SkeletonCard lines={1}/><SkeletonCard lines={1}/></>
        ) : messages.length === 0 ? (
          <div style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13,marginTop:30}}>{t("community_no_messages")}</div>
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
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={t("community_message_placeholder")} disabled={sending}
          style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:14,color:"var(--ink)"}}/>
        <div onClick={send} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: sending?"var(--ink-faint)":"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Send size={15} color="#fff"/>
        </div>
      </div>
    </div>
  );
}

function AssistantTab() {
  const { t, lang } = useLang();
  const { isPremium, refreshPremium } = usePremium();
  const [usage, setUsage] = useState({date: todayISO(), count: 0});
  const [showUpsell, setShowUpsell] = useState(false);
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
        const c = newConversation(t);
        setConversations([c]);
        setActiveId(c.id);
      }
      const u = await getAIUsageToday();
      setUsage(u);
      setLoading(false);
    })();
  }, []);

  useEffect(()=>{ if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; },[conversations, activeId, sending]);

  const persist = (list) => { setConversations(list); storageSet("assistant:conversations", list, false); };
  const active = conversations.find(c=>c.id===activeId);

  const send = async () => {
    if (!input.trim() || sending || !active) return;
    if (!isPremium && usage.count >= FREE_AI_DAILY_LIMIT) {
      setShowUpsell(true);
      return;
    }
    const text = input.trim();
    setInput("");
    setError(null);
    const userMsg = {role:"user", text};
    const updatedMsgs = [...active.messages, userMsg];
    const title = active.title === t("new_chat") ? text.slice(0,32) : active.title;
    let list = conversations.map(c => c.id===activeId ? {...c, messages:updatedMsgs, title, updatedAt:Date.now()} : c);
    persist(list);
    setSending(true);
    if (!isPremium) { const u = await incrementAIUsage(); setUsage(u); }
    try {
      const res = await callGemini(
        getAssistantSystemPrompt(lang),
        updatedMsgs.map(m => ({role: m.role==="bot" ? "assistant" : "user", content: m.text}))
      );
      if (!res.ok) throw new Error(res.error || "gemini_failed");
      const botText = res.text.trim() || t("assistant_fallback_reply");
      list = list.map(c => c.id===activeId ? {...c, messages:[...updatedMsgs, {role:"bot", text:botText}], updatedAt:Date.now()} : c);
      persist(list);
    } catch (e) {
      setError(t("assistant_error"));
      showToast(t("toast_assistant_failed"), "error");
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    const c = newConversation(t);
    const list = [c, ...conversations];
    persist(list);
    setActiveId(c.id);
    setShowHistory(false);
  };
  const deleteConversation = (id) => {
    const list = conversations.filter(c=>c.id!==id);
    const finalList = list.length ? list : [newConversation(t)];
    persist(finalList);
    if (id === activeId) setActiveId(finalList[0].id);
  };

  if (loading || !active) {
    return (
      <div style={{height:"100%",background:"var(--bg)",padding:"20px 20px 110px"}}>
        <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 14px"}}>{t("assistant_title")}</h2>
        <SkeletonCard lines={1}/><SkeletonCard lines={1}/><SkeletonCard lines={1}/>
      </div>
    );
  }

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"var(--bg)"}}>
      <div style={{padding:"20px 20px 10px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:0}}>{t("assistant_title")}</h2>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",marginTop:4}}>{t("assistant_disclaimer")}</div>
          <div style={{fontSize:11,fontWeight:700,marginTop:6,color: isPremium ? "var(--purple-deep)" : "var(--ink-faint)",display:"flex",alignItems:"center",gap:4}}>
            {isPremium ? (<><Crown size={11}/> {t("assistant_unlimited_badge")}</>) : t("assistant_usage_badge", Math.max(0, FREE_AI_DAILY_LIMIT-usage.count), FREE_AI_DAILY_LIMIT)}
          </div>
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
        {getAssistantSuggestions(lang).map(q=>(
          <div key={q} onClick={()=>setInput(q)} className="abp-tap" style={{fontSize:11.5,padding:"7px 12px",borderRadius:99,background:"var(--card)",color:"var(--ink-soft)",boxShadow:"var(--shadow-sm)"}}>{q}</div>
        ))}
      </div>
      <div style={{position:"absolute",bottom:78,left:16,right:16,display:"flex",gap:8,alignItems:"center",background:"var(--card)",borderRadius:20,padding:"8px 8px 8px 16px",boxShadow:"var(--shadow)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={t("assistant_input_placeholder")} disabled={sending}
          style={{flex:1,border:"none",outline:"none",background:"transparent",fontSize:14,color:"var(--ink)"}}/>
        <div onClick={send} className="abp-tap" style={{width:38,height:38,borderRadius:19,background: sending?"var(--ink-faint)":"var(--ink)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Send size={15} color="#fff"/>
        </div>
      </div>

      {showHistory && (
        <Modal title={t("assistant_history_title")} onClose={()=>setShowHistory(false)}>
          {conversations.length === 0 ? (
            <div style={{textAlign:"center",color:"var(--ink-faint)",fontSize:13,padding:20}}>{t("assistant_no_chats")}</div>
          ) : conversations.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div onClick={()=>{setActiveId(c.id); setShowHistory(false);}} className="abp-tap" style={{flex:1,background: c.id===activeId?"var(--pink)":"var(--card)",borderRadius:16,padding:14,boxShadow:"var(--shadow-sm)"}}>
                <div style={{fontWeight:700,fontSize:14}}>{c.title}</div>
                <div style={{fontSize:11.5,color:"var(--ink-soft)",marginTop:3}}>{new Date(c.updatedAt).toLocaleString(localeOf(lang))} · {t("assistant_message_count", c.messages.length)}</div>
              </div>
              <div onClick={()=>deleteConversation(c.id)} className="abp-tap" style={{width:34,height:34,borderRadius:17,background:"var(--card)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-sm)"}}><X size={14}/></div>
            </div>
          ))}
        </Modal>
      )}

      {showUpsell && (
        <AIUpsellModal
          onClose={()=>setShowUpsell(false)}
          onUpgraded={async ()=>{ await refreshPremium(); setShowUpsell(false); }}
        />
      )}
    </div>
  );
}

/* ============================================================
   AI KULLANIM PAYWALL'İ — ücretsiz günlük hak dolduğunda gösterilir.
   ============================================================ */
function AIUpsellModal({onClose, onUpgraded}) {
  const [showCard, setShowCard] = useState(false);
  if (showCard) return <PaymentMethodModal onClose={onClose} onUpgraded={onUpgraded}/>;
  return (
    <Modal title="Günlük AI Hakkın Doldu" onClose={onClose}>
      <div style={{textAlign:"center",padding:"6px 0 16px"}}>
        <div style={{width:56,height:56,borderRadius:28,background:"linear-gradient(135deg, var(--purple), var(--pink))",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}>
          <Crown size={26} color="#fff"/>
        </div>
      </div>
      <div style={{fontSize:13.5,lineHeight:1.7,color:"var(--ink-soft)",marginBottom:18,textAlign:"center"}}>
        Ücretsiz hesaplar günde {FREE_AI_DAILY_LIMIT} asistan mesajıyla sınırlıdır. Premium'a geçerek sınırsız AI asistan, reklamsız kullanım ve detaylı raporların kilidini açabilirsin.
      </div>
      <PrimaryButton onClick={()=>setShowCard(true)}>Premium'a Geç</PrimaryButton>
      <div onClick={onClose} className="abp-tap" style={{textAlign:"center",marginTop:14,fontSize:12.5,color:"var(--ink-faint)",fontWeight:600}}>Yarın tekrar dene</div>
    </Modal>
  );
}

/* ============================================================
   ÖDEME YÖNTEMİ — bu demo ortamında gerçek bir ödeme altyapısına
   (iyzico, Stripe, PayTR vb.) bağlı DEĞİLDİR. Kart numarası ve CVV asla
   saklanmaz; yalnızca kartın son 4 hanesi ve sahibinin adı, cihazda
   kalıcı olarak (Firestore) tutulur. Gerçek ödeme almak için bu
   modülün bir ödeme sağlayıcısının resmi SDK/API'siyle backend
   üzerinden entegre edilmesi gerekir.
   ============================================================ */
function PaymentMethodModal({onClose, onUpgraded}) {
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
      // DEMO aktivasyon: gerçek ortamda bu satır yerine ödeme sağlayıcısının
      // başarı webhook'u/sunucu onayı premium'u aktifleştirmeli.
      await setPremiumStatus(true, "demo_card");
      if (onUpgraded) onUpgraded();
      showToast("Ödeme yöntemi eklendi, Premium aktifleşti ✓ (demo — gerçek tahsilat yapılmaz)");
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
/* ============================================================
   HAKKIMIZDA & GİZLİLİK POLİTİKASI (KVKK Aydınlatma Metni)
   ÖNEMLİ: Bu metinler bir TASLAKTIR, hukuki dan\u0131şmanlık yerine
   geçmez. Uygulaman\u0131n koddaki ger\u00e7ek \u00f6zelliklerine (Google/Apple/
   e-posta ile giri\u015f, Firestore veri saklama, Gemini AI asistan\u0131,
   konum bazl\u0131 ma\u011faza bulma, Anne Pazar\u0131 2. el ilan alan\u0131) g\u00f6re
   haz\u0131rland\u0131. Yay\u0131na almadan \u00f6nce mutlaka bir avukata,
   \u00f6zellikle bebe\u011fe ait sa\u011fl\u0131k/geli\u015fim verisinin KVKK'da "\u00f6zel
   nitelikli ki\u015fisel veri" say\u0131labilece\u011fi ve VERB\u0130S kayd\u0131
   gereklili\u011fi a\u00e7\u0131s\u0131ndan kontrol ettirin.
   [AD SOYAD 1], [AD SOYAD 2] ve [E-POSTA ADRESİ] alanlarını
   kendi bilgilerinizle değiştirin.
   ============================================================ */
const ABOUT_US_SECTIONS = [
  {h:"Biz Kimiz?", p:"Anne & Bebek, [AD SOYAD 1] ve [AD SOYAD 2] tarafından kurulan, hamilelik ve bebek bakım sürecinde ailelere destek olmayı amaçlayan bir mobil uygulamadır. Şirket değil, şahıs olarak iki kurucu ortak tarafından geliştirilip işletilmektedir."},
  {h:"Ne Sunuyoruz?", p:"Uygulama içerisinde bebek gelişim takibi, uyku sesleri ve ninniler, uyku hikayeleri, anne sağlığı ile ilgili bilgilendirici içerikler, yapay zeka destekli soru-cevap asistanı, yakındaki bebek mağazalarını bulma ve anneler arasında ikinci el eşya alışverişi (WordBabe Satış) gibi özellikler sunulmaktadır."},
  {h:"Sağlık İçeriği Uyarısı", p:"Uygulamadaki sağlık, beslenme ve gelişimle ilgili tüm içerikler yalnızca genel bilgilendirme amaçlıdır; bir doktorun veya sağlık profesyonelinin tavsiyesinin yerini tutmaz. Sağlığınız veya bebeğinizin sağlığıyla ilgili endişeleriniz için mutlaka bir uzmana danışın."},
  {h:"Yapay Zeka Asistanı Uyarısı", p:"Uygulama içindeki soru-cevap asistanı yapay zeka (AI) teknolojisiyle çalışır ve verdiği yanıtlar hatalı veya eksik olabilir. Bu yanıtlar tıbbi teşhis veya tedavi tavsiyesi olarak değerlendirilmemelidir."},
  {h:"İletişim", p:"Görüş, öneri ve talepleriniz için: [E-POSTA ADRESİ]"}
];
const PRIVACY_POLICY_SECTIONS = [
  {h:"Veri Sorumlusu", p:"6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, bu uygulama kapsamında işlenen kişisel verileriniz bakımından veri sorumlusu [AD SOYAD 1] ve [AD SOYAD 2]'dir (bundan sonra \"Uygulama Sahipleri\" olarak anılacaktır)."},
  {h:"Hangi Verileri Topluyoruz?", p:"(a) Hesap bilgileri: ad, e-posta adresi ve Google/Apple ile giriş yaptığınızda ilgili sağlayıcıdan alınan kimlik bilgileri; (b) Bebeğinize/çocuğunuza ait olarak sizin girdiğiniz bilgiler (doğum tarihi, gelişim/büyüme kayıtları gibi); (c) Uygulama içi yapay zeka asistanına yönelttiğiniz sorular ve içerikleri; (d) Yakındaki mağaza/hizmet bulma özelliğini kullandığınızda konum bilginiz; (e) WordBabe Satış bölümünde oluşturduğunuz ilan bilgileri; (f) Uygulama kullanım tercihleri (tema, hatırlatıcılar gibi)."},
  {h:"Özel Nitelikli Veri Uyarısı", p:"Bebeğinize/çocuğunuza ait girdiğiniz sağlık ve gelişim bilgileri KVKK kapsamında özel nitelikli kişisel veri sayılabilir. Bu bilgileri uygulamaya girerek, veli/vasi sıfatınızla bu verilerin işlenmesine açık rıza verdiğinizi kabul edersiniz."},
  {h:"Verileri Neden İşliyoruz?", p:"Verileriniz; hesabınızın oluşturulması ve yönetilmesi, uygulama özelliklerinin (takip, hatırlatıcı, ninni/ses, AI asistan, ilan, konum bazlı arama) size sunulabilmesi, uygulamanın geliştirilmesi ve güvenliğinin sağlanması amacıyla işlenir."},
  {h:"Verileriniz Kimlerle Paylaşılıyor?", p:"Verileriniz, uygulamanın altyapısını sağlayan Google Firebase (kimlik doğrulama ve Firestore veritabanı barındırma), yapay zeka asistanı için Google Gemini API ve konum/harita özellikleri için Google Haritalar gibi hizmet sağlayıcılarla, yalnızca ilgili hizmetin çalışabilmesi için gerekli ölçüde paylaşılır. Bu sağlayıcılar kişisel verilerinizi kendi gizlilik politikaları çerçevesinde işler."},
  {h:"WordBabe Satış İlanları", p:"WordBabe Satış bölümünde paylaştığınız ilan bilgileri (fotoğraf, açıklama, fiyat gibi) diğer tüm kullanıcılar tarafından görüntülenebilir. İlan içeriğinize kişisel iletişim bilgisi eklerseniz bunun da görünür olacağını unutmayın."},
  {h:"Verilerin Saklanma Süresi", p:"Verileriniz, hesabınız aktif olduğu sürece ve yukarıda belirtilen amaçların gerektirdiği süre boyunca saklanır; hesabınızı sildiğinizde ilgili veriler mevzuatın izin verdiği ölçüde silinir veya anonim hale getirilir."},
  {h:"KVKK Kapsamındaki Haklarınız", p:"KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/dışında aktarıldığı üçüncü kişileri bilme, eksik/yanlış işlenmişse düzeltilmesini isteme, silinmesini/yok edilmesini isteme ve bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme haklarına sahipsiniz."},
  {h:"Başvuru Yöntemi", p:"Yukarıdaki haklarınızı kullanmak için taleplerinizi [E-POSTA ADRESİ] adresine iletebilirsiniz."},
  {h:"Değişiklikler", p:"Bu gizlilik politikası zaman zaman güncellenebilir; güncel sürüm her zaman uygulama içinde yayınlanır."}
];
function LegalContent({sections}) {
  return (
    <div>
      {sections.map((s,i)=>(
        <div key={i} style={{marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:13.5,marginBottom:4}}>{s.h}</div>
          <div style={{fontSize:12.5,lineHeight:1.7,color:"var(--ink-soft)"}}>{s.p}</div>
        </div>
      ))}
    </div>
  );
}


function AccountDetail({authUser, onBack}) {
  const [form, setForm] = useState({adSoyad:"", telefon:"", sehir:""});
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const email = authUser && !authUser.isAnonymous ? (authUser.email || "—") : null;

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("profile:account", false);
    if (saved) setForm({adSoyad: saved.adSoyad||"", telefon: saved.telefon||"", sehir: saved.sehir||""});
    setLoaded(true);
  })(); }, []);

  const save = async () => {
    setBusy(true);
    const ok = await storageSet("profile:account", form, false);
    setBusy(false);
    if (ok) showToast("Bilgiler kaydedildi ✓");
    else showToast("Kaydedilemedi, tekrar deneyin", "error");
  };

  if (!loaded) return null;

  return (
    <Screen title="Hesap Bilgileri" onBack={onBack}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",marginBottom:6}}>Giriş yapılan e-posta</div>
        <div style={{padding:"12px 14px",borderRadius:14,background:"var(--card)",fontSize:14.5,fontWeight:600,color:email?"var(--ink)":"var(--ink-faint)"}}>
          {email || "Henüz e-posta ile giriş yapılmadı"}
        </div>
      </div>
      <Input label="Ad Soyad" value={form.adSoyad} onChange={(v)=>setForm(f=>({...f, adSoyad:v}))} placeholder="Adınız Soyadınız"/>
      <Input label="Telefon Numarası" value={form.telefon} onChange={(v)=>setForm(f=>({...f, telefon:v}))} placeholder="05xx xxx xx xx"/>
      <Input label="Şehir" value={form.sehir} onChange={(v)=>setForm(f=>({...f, sehir:v}))} placeholder="Yaşadığınız şehir"/>
      <PrimaryButton disabled={busy} style={{marginTop:14}} onClick={save}>{busy?"Kaydediliyor...":"Kaydet"}</PrimaryButton>
    </Screen>
  );
}

function ProfileTab({children, onAddChild, onRemoveChild, onRenameChild, onOpenChildProfile, theme, setTheme, onOpenAdmin, onOpenCalendar, onOpenAccount, authUser, onLogout}) {
  const { t } = useLang();
  const { isPremium, refreshPremium } = usePremium();
  const [reminders, setReminders] = useState([]);
  const [editingReminder, setEditingReminder] = useState(null); // {id:null} => yeni, {id,...} => düzenleme
  const [reminderDraft, setReminderDraft] = useState({label:"", date:"", time:"", repeat:"none"});
  const [showPayment, setShowPayment] = useState(false);
  const [momName, setMomName] = useState("Anne Adı");
  const [editMom, setEditMom] = useState(false);
  const [renameChild, setRenameChild] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("profile:mom", false);
    if (saved && saved.name) setMomName(saved.name);
  })(); }, []);

  useEffect(()=>{ (async ()=>{
    const saved = await storageGet("profile:reminders", false);
    if (saved) { setReminders(saved); return; }
    // İlk açılışta örnek hatırlatıcılarla başla
    const defaults = [
      {id:1, label:"Doktor Randevusu", date: addDaysISO(todayISO(),1), time:"10:00", repeat:"none", on:true, lastFiredKey:null},
      {id:2, label:"Vitamin Hatırlatması", date:null, time:"09:00", repeat:"daily", on:true, lastFiredKey:null},
      {id:3, label:"Su İçme", date:null, time:null, repeat:"daily", on:false, lastFiredKey:null},
      {id:4, label:"Aşı Takibi", date:null, time:null, repeat:"none", on:true, lastFiredKey:null},
    ];
    setReminders(defaults);
    await storageSet("profile:reminders", defaults, false);
  })(); }, []);

  const saveReminders = async (list) => {
    setReminders(list);
    await storageSet("profile:reminders", list, false);
  };

  const toggleReminder = async (id) => {
    const target = reminders.find(r=>r.id===id);
    const turningOn = !target.on;
    if (turningOn && target.time) {
      const perm = await requestNotificationPermission();
      if (perm === "denied") showToast(t("toast_notif_denied"));
    }
    await saveReminders(reminders.map(r=>r.id===id?{...r,on:turningOn}:r));
    showToast(turningOn ? t("toast_reminder_on") : t("toast_reminder_off"));
  };

  const openEditReminder = (r) => {
    setEditingReminder(r);
    setReminderDraft({label:r.label, date:r.date||"", time:r.time||"", repeat:r.repeat||"none"});
  };
  const openNewReminder = () => {
    setEditingReminder({id:null});
    setReminderDraft({label:"", date:todayISO(), time:"", repeat:"none"});
  };
  const saveReminderDraft = async () => {
    if (!reminderDraft.label.trim()) return;
    const time = reminderDraft.time || null;
    let list;
    if (editingReminder.id) {
      list = reminders.map(r => r.id===editingReminder.id
        ? {...r, label:reminderDraft.label.trim(), date:reminderDraft.date||null, time, repeat:reminderDraft.repeat}
        : r);
    } else {
      const newR = {id:Date.now(), label:reminderDraft.label.trim(), date:reminderDraft.date||null, time, repeat:reminderDraft.repeat, on:true, lastFiredKey:null};
      list = [...reminders, newR];
    }
    if (time) {
      const perm = await requestNotificationPermission();
      if (perm === "denied") showToast(t("toast_notif_denied"));
    }
    await saveReminders(list);
    setEditingReminder(null);
    showToast(t("toast_reminder_saved"));
  };
  const deleteReminderDraft = async () => {
    await saveReminders(reminders.filter(r=>r.id!==editingReminder.id));
    setEditingReminder(null);
    showToast(t("toast_reminder_deleted"));
  };

  const saveMomName = async (val) => {
    setMomName(val);
    await storageSet("profile:mom", {name: val}, false);
    showToast(t("toast_name_updated"));
  };

  return (
    <div style={{height:"100%",overflowY:"auto",background:"var(--bg)",padding:"20px 20px 110px"}} className="abp-scrollbar">
      <h2 className="abp-display" style={{fontSize:21,fontWeight:800,margin:"0 0 16px"}}>{t("profile_title")}</h2>
      <Card style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}} onClick={()=>onOpenAccount && onOpenAccount()}>
        <div style={{width:60,height:60,borderRadius:30,background:"var(--pink)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <User size={26}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:16}}>{momName}</div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{authUser && !authUser.isAnonymous ? (authUser.email || "Hesap bağlı") : "Henüz giriş yapılmadı"}</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      <Card style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}} onClick={()=>setEditMom(true)}>
        <IconBadge icon={Edit3} color="blue" size={38}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:14}}>{t("profile_mom_name_modal_title")}</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      {editMom && (
        <RenameModal
          title={t("profile_mom_name_modal_title")}
          initialValue={momName}
          placeholder={t("profile_mom_name_placeholder")}
          onClose={()=>setEditMom(false)}
          onSave={saveMomName}
        />
      )}

      <SectionTitle action={<div onClick={onAddChild} className="abp-tap" style={{display:"flex",alignItems:"center",gap:4,fontSize:12.5,fontWeight:700,color:"var(--ink-soft)"}}><Plus size={14}/>{t("profile_add")}</div>}>{t("profile_children_title")}</SectionTitle>
      {children.map(c=>(
        <Card key={c.id} onClick={()=>onOpenChildProfile && onOpenChildProfile(c)} style={{marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
          <IconBadge icon={c.status==="pregnant"?Baby:Heart} color="blue" size={38}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
            <div style={{fontSize:12,color:"var(--ink-soft)"}}>{c.status==="pregnant"?t("profile_pregnancy_tracking"):t("profile_postnatal_tracking")}</div>
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
              if (window.confirm(t("profile_child_remove_confirm", c.name))) {
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
          title={`"${renameChild.name}"`}
          initialValue={renameChild.name}
          placeholder={t("profile_child_rename_placeholder")}
          onClose={()=>setRenameChild(null)}
          onSave={(val)=>{ onRenameChild && onRenameChild(renameChild.id, val); showToast(t("toast_name_updated2")); }}
        />
      )}

      <SectionTitle>{t("profile_premium_title")}</SectionTitle>
      {isPremium ? (
        <Card style={{background:"linear-gradient(135deg, var(--purple), var(--pink))"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Crown size={20}/><div style={{fontWeight:800,fontSize:15}}>{t("profile_premium_active_title")}</div>
          </div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.7,marginTop:8}}>
            {t("profile_premium_active_desc")}
          </div>
        </Card>
      ) : (
        <Card style={{background:"linear-gradient(135deg, var(--purple), var(--pink))"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <Crown size={20}/><div style={{fontWeight:800,fontSize:15}}>{t("profile_premium_upgrade")}</div>
          </div>
          <div style={{fontSize:12.5,color:"var(--ink-soft)",lineHeight:1.7}}>
            {t("profile_premium_desc")}
          </div>
          <PrimaryButton style={{marginTop:12,padding:12,fontSize:13.5}} onClick={()=>setShowPayment(true)}>{t("profile_premium_btn")}</PrimaryButton>
        </Card>
      )}

      <SectionTitle>{t("profile_calendar_title")}</SectionTitle>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}} onClick={onOpenCalendar}>
        <IconBadge icon={CalendarDays} color="pink" size={34}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5}}>{t("profile_calendar_card_title")}</div>
          <div style={{fontSize:11,color:"var(--ink-soft)",marginTop:2}}>{t("profile_calendar_card_desc")}</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>

      {showPayment && <PaymentMethodModal onClose={()=>setShowPayment(false)} onUpgraded={refreshPremium}/>}

      <SectionTitle>{t("profile_market_title")}</SectionTitle>
      <Card
        style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}
        onClick={()=>window.open("https://annepazari.netlify.app/", "_blank", "noopener,noreferrer")}
      >
        <IconBadge icon={ShoppingBag} color="green" size={34}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13.5}}>{t("profile_market_title")}</div>
          <div style={{fontSize:11,color:"var(--ink-soft)",marginTop:2}}>{t("profile_market_desc")}</div>
        </div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>

      <SectionTitle action={
        <div onClick={openNewReminder} className="abp-tap" style={{fontSize:12,fontWeight:700,color:"var(--ink)",display:"flex",alignItems:"center",gap:3}}>
          <Plus size={13}/>{t("reminder_add_btn")}
        </div>
      }>{t("profile_reminders_title")}</SectionTitle>
      {reminders.map((r)=>(
        <Card key={r.id} style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}} onClick={()=>openEditReminder(r)}>
          <IconBadge icon={Bell} color="green" size={34}/>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13.5}}>{r.label}</div><div style={{fontSize:11.5,color:"var(--ink-soft)"}}>{reminderTimeLabel(r)}</div></div>
          <div onClick={(e)=>{e.stopPropagation(); toggleReminder(r.id);}} className="abp-tap" style={{width:42,height:24,borderRadius:12,background: r.on?"var(--ink)":"var(--ink-faint)",padding:2,display:"flex",justifyContent:r.on?"flex-end":"flex-start",flexShrink:0}}>
            <div style={{width:20,height:20,borderRadius:10,background:"#fff"}}/>
          </div>
        </Card>
      ))}
      {editingReminder && (
        <Modal title={t("reminder_modal_title")} onClose={()=>setEditingReminder(null)}>
          <Input label={t("reminder_label_label")} value={reminderDraft.label} placeholder={t("reminder_label_placeholder")}
            onChange={(v)=>setReminderDraft(d=>({...d,label:v}))}/>
          <Input label={t("reminder_date_label")} type="date" value={reminderDraft.date}
            onChange={(v)=>setReminderDraft(d=>({...d,date:v}))}/>
          <Input label={t("reminder_time_label")} type="time" value={reminderDraft.time}
            onChange={(v)=>setReminderDraft(d=>({...d,time:v}))}/>
          <div style={{fontSize:12.5,fontWeight:700,color:"var(--ink-soft)",margin:"2px 0 8px"}}>{t("reminder_repeat_label")}</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <Pill_ active={reminderDraft.repeat==="none"} onClick={()=>setReminderDraft(d=>({...d,repeat:"none"}))}>{t("reminder_repeat_none")}</Pill_>
            <Pill_ active={reminderDraft.repeat==="daily"} onClick={()=>setReminderDraft(d=>({...d,repeat:"daily"}))}>{t("reminder_repeat_daily")}</Pill_>
          </div>
          <div style={{fontSize:11.5,color:"var(--ink-faint)",lineHeight:1.5,marginBottom:14}}>{t("reminder_notif_hint")}</div>
          <PrimaryButton onClick={saveReminderDraft} disabled={!reminderDraft.label.trim()}>{t("reminder_save")}</PrimaryButton>
          {editingReminder.id && (
            <div onClick={deleteReminderDraft} className="abp-tap" style={{textAlign:"center",marginTop:14,fontSize:13,fontWeight:700,color:"#D9526B"}}>{t("reminder_delete")}</div>
          )}
        </Modal>
      )}

      <SectionTitle>{t("profile_settings_title")}</SectionTitle>
      <Card style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}} onClick={()=>setTheme(theme==="light"?"dark":"light")}>
        <IconBadge icon={theme==="light"?Sun:Moon} color="purple" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>{theme==="light"?t("profile_theme_light"):t("profile_theme_dark")}</div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      <Card
        style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}
        onClick={()=>setShowAbout(true)}
      >
        <IconBadge icon={Info} color="blue" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>{t("profile_about")}</div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      <Card
        style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}
        onClick={()=>setShowPrivacy(true)}
      >
        <IconBadge icon={Lock} color="purple" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>{t("profile_privacy")}</div>
        <ChevronRight size={16} color="var(--ink-faint)"/>
      </Card>
      <Card
        style={{display:"flex",alignItems:"center",gap:12,color:"#D98BA6"}}
        onClick={()=>{
          if (window.confirm(t("profile_logout_confirm"))) {
            onLogout && onLogout();
          }
        }}
      >
        <IconBadge icon={LogOut} color="pink" size={34}/>
        <div style={{flex:1,fontWeight:700,fontSize:13.5}}>{t("profile_logout")}</div>
      </Card>
      {showAbout && (
        <Modal title={t("profile_about")} onClose={()=>setShowAbout(false)}>
          <LegalContent sections={ABOUT_US_SECTIONS}/>
        </Modal>
      )}
      {showPrivacy && (
        <Modal title={t("profile_privacy")} onClose={()=>setShowPrivacy(false)}>
          <LegalContent sections={PRIVACY_POLICY_SECTIONS}/>
        </Modal>
      )}
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
      <Screen title="WordBabe Satış" onBack={onBack}>
        <SkeletonCard/>
      </Screen>
    );
  }

  if (!nickname) {
    return (
      <Screen title="WordBabe Satış" onBack={onBack}>
        <Card style={{textAlign:"center"}}>
          <IconBadge icon={ShoppingBag} color="pink" size={48}/>
          <div style={{fontWeight:800,fontSize:15.5,margin:"12px 0 6px"}}>WordBabe Satış'a Hoş Geldiniz</div>
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
    <Screen title="WordBabe Satış" onBack={onBack} right={
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
   UYGULAMA SİMGESİ (App Icon) — WordBabe logosu, favicon ve
   ana ekrana eklendiğinde (apple-touch-icon) gösterilecek simge
   olarak ayarlanır. Base64 olarak gömülüdür, ayrı dosya gerekmez.
   ============================================================ */
const APP_ICON_FAVICON_B64 = "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAK+0lEQVR4nE2XWXNcx3XHf73cuTODwTIgdoAEQYIQBK4SRYqUElMSS4pUdiou23FKL7Ge4lTlIXnKUz5BPkEenCqnUq6KkqpIiS1ZpqmFNqmVFkETFEETJEHsxACzL/fO7SUPA1m5Vaf63u7b3f/zP+d0nyO8957/99gowq6vQbmMiCO8NQjn8IDAg/eAx+Nhb6bwnW/RGeq8f72gkJAKoDePOHAQ1ZfvjHkPQqC//s97T2t+HnfjBrJcRtk20lqUswiXIJwD7/gGr8c7DzjEXovzYPf6+EYvj8BLgcvmSJ46g3r5NVSYBu8R3jnvnKNy+UPswm3CUKMESOeQzqKwCNcRvOu0JoEkAe/Auc4uUoJUe8x4hP+arT9qCM7hm02SqUPIN/4WnetGOO995fqXtD65TiodomzSEW9R3iKdQ3iLbseQxHiliXI9RLkeTJgGIVBRk7BWIl0poVqNDu1S4a3tMCHlN0C0hkqZ9ulzqNd/hG4Xi9QW7qPSXVhh9ybrjsW9RHuDjmMavQNsH5qlOD5FqzePS6XxSoAQCO/RJqInrpLfXKZ38RbZ0jaiO4tPDBSKiNh0ABgDuR70wjzmzml0Y22TxLgOsq+dSghAINttEqVZeeZbPJ45QRxmCJREKYHyHinoOKhpMaxLDOzeRmQi4otPIVtNwu37OKWQ8Rjyi3uIcuOPREjvYGEeHZXqWBWglEdYsEKAEqTahkaul4fPfIvK0ASpJCItJfWtTRr3viIpF9CZDKkDh3ny+BgHb16hlTiSoRG6787jsdRGpwjqVQLVRJw8DFcXENZ1QkVIZOExuh0brJRYyR4DEmUMtZ593Dv3CrYrQ3dcI0nnePj+L1Gf/pI8Ec45rIfaR55b42OMXTzN1pkXqDcNIzKHStoU+meQk2kOfPEuMg2qJwfFKghACIgitPUCIwKkcHglED4hSud4ePQsufoWcdKNGRpm/aNLhB+9yfBAL+WmplxvYp0jmw6o3L3Lr5RmZvYFJn/zNt2P7+ODNFk+ZfmvfowVmjCJQYo9LTu+gzVIIwRGaawMMELh8KweOcVwqsXZ1CbTrWVKqxuYa+8AnuXHFXaLFZJ2gpSCZquNSYVsXr/B4r//lLh7DLVWR9/dJOqboLe0Tmq3yO7+OUxkOxsjQWlEq4l0QmGkJpEa76GcH2FnYAITGUyQAZ2lvnSXaHONrd0Ghe0KlWpEnFgajRalSoNauYlMZ0huz/Mw10Xl+VfYPf4czaefYvCjyzRn57gz/DSPp09CkuCF2DO3QFohOwCEJpEBpbEpAgkbuQmulvfxVf8x6psr7G6XKLcMUWKolGtsPy5RKbcYy3fzxt98l5dePsvmdoWu2zeQRyZInn6Cod++T/OZ09wbPoMsV9l84iRJ2NU5zPbMoK1UGBWgXUIz000p108+EBzoC7klhim/+S+0PvuAGpq//vY5th4X8VKSzoZETnLhpVOI7iwN60m8p3nkKN2FDTJrGxRevMhK9iCliqL/0VckIxMUp+YYXryOT6fxgHZCkkhF4A3N3n0oLxHrazwYn6J27V167lyhpQVJYilV6/zJq8+iBvKs31lmbaOADRQ7myU+uXaTquyiEE7wcbqNPnWEpGuGpNGgX0Z0H3qSB66LyvhBhu9cRwiJEB5tkRihSKQiSncTWEO2WmRlcIpo/SEutjgvyQaat/73E3qnDvCE9QzEbYbOncJsbtIsVqlXW/SNjhNdu8RWKkO4b5CiWGLw/EuMqgYZ6XCum3LvEAQpcICSSKMkRgYkMiBRmnaQYmXiOPkQ5MAEpd0yUkoy2RRSgt4qIIf2IfaPEG9sYZXi4Eg/oDh6dBz1cJ5Zs0Kfq/D0ZJ6tK+/xyPVxs5Ilk9aYbBcmne2EpBDfRIFVARZF4hSBELQbbfrPvUp78gTVwjambegbHWS4r4v6JzdJ9feSyoSoMMV/fvB7hg5P8NqLTzJ7/iRzf/4io66ANG3mRrvYvf+AyT7F4e1FRBBiVdC5IDsANEZKjFQ4odkX7XBi+wvGo3V0OsPc3/8z+df/kXLQx5+98gw9c1PI7SKX/vXnfLmyy9vv3aBhMoz0pTGtmMmZKRo7ZQ5OT1J5sMTB6QPYrYco79moKxpGIaUAoRBCIV0SY1RAgsQ7x6FUkeEByfBYlp7As/NohX26xQ//4ce0jIB0iuz5E5QjQ9iVJzc0yvGjk4z0Zrl35xEP/7BK2yuqpQo2lSWXDWi3ItaiNHG6Cx21kN6D0h0TJDsFbBBilcLEbXZ6DuCHhkiQVHYriLsf8Z1vn+DMxbNk557l15fmWWs0mT45jfGSkcOHEb19FMtVarWIo8cmyZuIjYUlhLTY7WWcDFHGouoVgnoNZS1e7wGwQpFIjZEaYdo8KCiubg1wc3eQ1YVb/On5Q4T5PEl5k5PPH+fUD15npdGHnjpBqVxj9swJ+oZG+PDDeWwSc+PTr/jg82VWew4RZgK+/PwO4cAEmYyiMH6UfHEDLyRWBnip0FYIEqnQKkBZQ9TyBGi6Q4+v7TKYH4ckRoVp4uIOg/syDP7Fqyxd+4DegUGWbi9RWN9i7rXvIvv66B0dYnZmmu37i9x/601i43H9MRnlSJeq9G+vkQQhQkq83wNghCSRGjAI08STxVig3caXd2H/QWQYsPrVEs3dHU5cOMu1X7zP0JPHmZ2e5uhz5wlEDVLD+MUvERv3qFWr7OtKcez0DD+7tci96llGth/SUy+SBBm0T8ArpKVzF1gpaasA6VpU645CQ2CcprK+ATbBxzGTs0corBZ4dPkymcFxXv7+95ia2o/SkqiRkNTLuMlp/MAAY32KzWKDx8urtMN+MsDk2m2sDrBKYWWAkwrphMBIRSI6YgBlamgFLULuzi9CrYS1EGQ00+ef5ef/8zHf+7s30DurNH93HSFDpMxAu0J74w6/+MlPuXrpE6rVJu/Mt1BHX2R46Sa99SLtIIMTCisUVkik8xIjNGavM5EaS5skiuge3s/K4xqt5WVE3MRFbSZnD3D2B3/Jb//jv9hJYlKnjuO2lzC3P0PGDb688jnaG/rbZXJ9Q6gf/hMHkjJj6wtEqQxOSJwIOvmHVGhhDQ6FEQovHTiBx5OyNYJchrHhfdz67AZne7pIhibxAs5efJqVxSHu3LhLXPscrQQ6SLF6+QuOzwzy/HdeYfWtX/F26imO2Dr773+KTaXA2U46RidDFk4h3v23d/zNIxdJ2xgBaG9Q3qG9I4kjZuUWXfeuENLi5AvPYvNj+EwOncuC1JhWQhy1SXVleby8ycbbPyNyKRbUHDOnzjG6dRvtLAqHdgbtDMpZtHeIZhk9WnjA7w9dwHmBFAIjNB7buavDNH/wU4wdGyK68WvK733O6WOj5MbGIZeHIIUWoE1Me22XR/NrfNqcYWD2LMdykt7CXawKEFKDjRFS79WFIIRCxA30/uJ9hnYfsj48RzaugVIgwItO5RV4y2YSkj79fRYeLLL4xe84mL5FPgtaCYzzFKsJW400dmCWU889Sa5VRDRqxDqNdha8AQKwBiE8aImPG4T1IjotBGdu/De7F8aIwxyBaXUOCXTHXlKghaXdbtFzaAYxeYS10i7L1SKiHRGGKTL9XQx3ZUkLB40dYjwyyKCdwQLCsbdWJyf13qE3l0jZNlqGWSaqW1y4+hM+Pv8jojCHdxYlBQgN2E5JJ6HdTlDeke7rJcj3ob1DWoMyCSaJaBlHoNPgEoSzWKk6hepeaSgA6TxqeYF0fYewu4f/A/0dfIJP1VfnAAAAAElFTkSuQmCC";
const APP_ICON_TOUCH_B64 = "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";
function useAppIcon() {
  useEffect(()=>{
    if (typeof document === "undefined") return;
    document.title = "WordBabe";

    const setLink = (rel, href, sizes) => {
      let link = document.querySelector(`link[rel="${rel}"]${sizes?`[sizes="${sizes}"]`:""}`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        if (sizes) link.sizes = sizes;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    setLink("icon", `data:image/png;base64,${APP_ICON_FAVICON_B64}`);
    setLink("shortcut icon", `data:image/png;base64,${APP_ICON_FAVICON_B64}`);
    setLink("apple-touch-icon", `data:image/png;base64,${APP_ICON_TOUCH_B64}`, "180x180");
  }, []);
}

/* ============================================================
   ROOT APP
   ============================================================ */
function AppInner() {
  useAppIcon();
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

  // Hatırlatıcılar — Profil > Hatırlatıcılar bölümünde ayarlanan tarih/saatler
  // burada, uygulama açıkken periyodik olarak kontrol edilir. Zamanı gelen
  // ve açık (on) olan bir hatırlatıcı için tarayıcı bildirimi + uygulama
  // içi toast gösterilir. "Tekrar yok" olanlar bir kez tetiklendikten sonra
  // otomatik kapanır; "Her gün" olanlar her gün yeniden tetiklenir
  // (lastFiredKey ile aynı gün içinde tekrar tetiklenmesi önlenir).
  useEffect(()=>{
    const checkReminders = async () => {
      const list = await storageGet("profile:reminders", false);
      if (!list || !list.length) return;
      const now = new Date();
      const todayStr = todayISO();
      const hhmm = now.toTimeString().slice(0,5);
      let changed = false;
      const updated = list.map(r=>{
        if (!r.on || !r.time) return r;
        const isDue = r.repeat === "daily" ? true : r.date === todayStr;
        if (!isDue || r.time !== hhmm || r.lastFiredKey === todayStr) return r;
        fireReminderNotification(r.label, reminderTimeLabel(r));
        showToast(`🔔 ${r.label}`);
        changed = true;
        return r.repeat === "daily" ? {...r, lastFiredKey: todayStr} : {...r, on:false, lastFiredKey: todayStr};
      });
      if (changed) await storageSet("profile:reminders", updated, false);
    };
    checkReminders();
    const id = setInterval(checkReminders, 30000);
    return () => clearInterval(id);
  }, []);

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
          ) : detail === "account" ? (
            <AccountDetail authUser={authUser} onBack={()=>setDetail(null)}/>
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
              {activeTab === "activities" && <ActivitiesTab child={activeChild}/>}
              {activeTab === "nearby" && <NearbyTab/>}
              {activeTab === "community" && <CommunityChat/>}
              {activeTab === "assistant" && <AssistantTab/>}
              {activeTab === "profile" && (
                <ProfileTab
                  children={children}
                  theme={theme}
                  setTheme={setTheme}
                  authUser={authUser}
                  onOpenAdmin={()=>setDetail("admin")}
                  onOpenCalendar={()=>setDetail("calendar")}
                  onOpenAccount={()=>setDetail("account")}
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

export default function App() {
  return (
    <LanguageProvider>
      <AppInner/>
    </LanguageProvider>
  );
}
