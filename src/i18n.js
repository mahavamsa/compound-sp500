export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "id"];

const LOCALES = {
  en: {
    tag: "en-US",
    name: "English",
    static: {
      pageTitle: "Compound S&P 500",
      heroEyebrow: "Investing Simulator",
      heroTitle: "See what your future self can own.",
      heroCopy:
        "Explore how a starting amount plus steady S&P 500 investing can grow month by month. The market snapshot is live. The projection is an educational simulation, not financial advice.",
      heroChipLive: "Live snapshot + adjustable return",
      marketSnapshot: "Current S&P 500 snapshot",
      indexLevel: "Index level",
      ytdReturn: "YTD return",
      lastClose: "Last close",
      defaultAnnualReturn: "Default annual return",
      futureSelf: "Future self",
      targetAge: "Target age",
      investorLevel: "Investor level",
      yourPlan: "Your plan",
      shapeSimulation: "Shape the simulation",
      currentAge: "Current age",
      investUntilAge: "Invest until age",
      startingAmount: "Starting amount",
      monthlyDca: "Monthly DCA",
      expectedAnnualReturn: "Expected annual return",
      starter: "Starter",
      steady: "Steady",
      stretch: "Stretch",
      projection: "Projection",
      compoundingDashboard: "Compounding dashboard",
      level: "Level",
      totalInvested: "Total invested",
      totalGain: "Total gain",
      compoundingShare: "Compounding share",
      nextMilestone: "Next milestone",
      youContributed: "You contributed",
      compoundingCreated: "Compounding created",
      progressToNextTarget: "Progress to next target",
      estimatedUnlockTiming: "Estimated unlock timing",
      monthlyJourney: "Monthly journey",
      chartTitle: "Watch invested dollars and compounding diverge",
      portfolioValue: "Portfolio value",
      gameMode: "Game mode",
      achievementsTitle: "Unlock compounding achievements",
      languageLabel: "Language"
    },
    sourceLabels: {
      liveStooq: "Live via Stooq",
      fallback: "Fallback snapshot"
    },
    labels: {
      loading: "Loading...",
      allMilestonesCleared: "All milestones cleared",
      beyondCurrentPlan: "Beyond current plan",
      alreadyAchieved: "Already achieved",
      adjustAges: "Adjust ages",
      projectedValueAtTargetAge: "Projected value at your target age.",
      start: "Start",
      monthlyDeposits: "monthly deposits",
      agePrefix: "Age"
    },
    errors: {
      agesInvalid: "Ages must be valid numbers.",
      targetAgeGreater: "Target age must be greater than current age."
    },
    investorLevels: [
      { minimum: 0, label: "Seed Starter", copy: "You are building the habit that matters most: staying invested." },
      { minimum: 50000, label: "Momentum Builder", copy: "Your portfolio has enough size for compounding to feel real." },
      { minimum: 100000, label: "Six-Figure Climber", copy: "The base is strong now. Time starts doing heavy lifting." },
      { minimum: 250000, label: "Compounding Operator", copy: "Your money is starting to create meaningful money on its own." },
      { minimum: 500000, label: "Half-Million Runner", copy: "The snowball is large enough to change future choices." },
      { minimum: 1000000, label: "Millionaire Track", copy: "You are in the range where patience can outperform hustle." },
      { minimum: 2000000, label: "Freedom Engine", copy: "Compounding has become a serious wealth machine." }
    ],
    achievements: {
      habitBuilderTitle: "Habit Builder",
      habitBuilderTarget: "Stay invested for 10 years",
      habitBuilderUnlocked: (duration) => `${duration} on the clock.`,
      habitBuilderLocked: (duration) => `${duration} projected so far.`,
      snowballTitle: "Snowball Activated",
      snowballTarget: "Compounding gain beats one year of DCA",
      snowballUnlocked: (duration) => `Reached after ${duration}.`,
      snowballLocked: "Not reached yet in this plan.",
      doubleTitle: "Double the Day-One Stack",
      doubleTarget: "Portfolio doubles the starting amount",
      doubleUnlocked: (age) => `Unlocked near age ${age}.`,
      doubleLocked: "Needs more time or contribution power.",
      doubleNeedsStarting: "Add a starting amount to unlock this badge.",
      sixFigureTitle: "Six-Figure Club",
      sixFigureTarget: "Reach $100,000",
      sixFigureUnlocked: "Six figures unlocked.",
      sixFigureLocked: (remaining) => `${remaining} to go.`,
      halfMillionTitle: "Half-Million Run",
      halfMillionTarget: "Reach $500,000",
      halfMillionUnlocked: "Half-million checkpoint cleared.",
      halfMillionLocked: (remaining) => `${remaining} to go.`,
      millionaireTitle: "Millionaire Track",
      millionaireTarget: "Reach $1,000,000",
      millionaireUnlocked: "Seven figures projected.",
      millionaireLocked: (remaining) => `${remaining} to go.`,
      unlocked: "Unlocked",
      locked: "Locked"
    },
    journey: {
      timeInMarketLabel: "Time in market",
      timeInMarketCopy: (deposits, currentAge, targetAge) =>
        `${deposits} monthly deposits from age ${currentAge} to ${targetAge}.`,
      snowballMomentLabel: "Snowball moment",
      snowballMomentValue: (age) => `Age ${age}`,
      snowballMomentCopy: (dateLabel) =>
        `Projected gain matches one full year of DCA by ${dateLabel}.`,
      snowballMomentLocked: "Extend the horizon or increase DCA to activate the snowball sooner.",
      standoutCheckpointLabel: "Standout checkpoint",
      standoutCheckpointCopy: (dateLabel) => `Likely reached around ${dateLabel}.`,
      standoutCheckpointFallback: (gainLabel) =>
        `Projected gain lands at ${gainLabel} by the finish line.`,
      stillBuilding: "Still building"
    },
    templates: {
      futureSelfCopy: (age, balance, gain) =>
        `At age ${age}, this plan projects ${balance} with ${gain} from growth.`,
      chartCaption: (startingAmount, monthlyContribution, duration) =>
        `Starting with ${startingAmount} and adding ${monthlyContribution} per month over ${duration}.`,
      depositCount: (months) => `${months} monthly deposits`
    }
  },
  id: {
    tag: "id-ID",
    name: "Bahasa Indonesia",
    static: {
      pageTitle: "Compound S&P 500",
      heroEyebrow: "Simulator Investasi",
      heroTitle: "Lihat apa yang bisa dimiliki dirimu di masa depan.",
      heroCopy:
        "Eksplor bagaimana modal awal dan investasi rutin ke S&P 500 bisa tumbuh dari bulan ke bulan. Snapshot pasar diambil secara live. Proyeksi ini bersifat edukatif, bukan nasihat keuangan.",
      heroChipLive: "Snapshot live + return bisa diubah",
      marketSnapshot: "Snapshot S&P 500 saat ini",
      indexLevel: "Level indeks",
      ytdReturn: "Return YTD",
      lastClose: "Penutupan terakhir",
      defaultAnnualReturn: "Return tahunan default",
      futureSelf: "Diri masa depan",
      targetAge: "Usia target",
      investorLevel: "Level investor",
      yourPlan: "Rencana kamu",
      shapeSimulation: "Atur simulasi",
      currentAge: "Usia sekarang",
      investUntilAge: "Investasi sampai usia",
      startingAmount: "Modal awal",
      monthlyDca: "DCA bulanan",
      expectedAnnualReturn: "Return tahunan asumsi",
      starter: "Pemula",
      steady: "Stabil",
      stretch: "Agresif",
      projection: "Proyeksi",
      compoundingDashboard: "Dashboard compounding",
      level: "Level",
      totalInvested: "Total modal masuk",
      totalGain: "Total keuntungan",
      compoundingShare: "Porsi compounding",
      nextMilestone: "Milestone berikutnya",
      youContributed: "Kontribusi kamu",
      compoundingCreated: "Hasil compounding",
      progressToNextTarget: "Progres ke target berikutnya",
      estimatedUnlockTiming: "Perkiraan waktu tercapai",
      monthlyJourney: "Perjalanan bulanan",
      chartTitle: "Lihat modal dan compounding mulai berjauhan",
      portfolioValue: "Nilai portofolio",
      gameMode: "Mode game",
      achievementsTitle: "Buka achievement compounding",
      languageLabel: "Bahasa"
    },
    sourceLabels: {
      liveStooq: "Live via Stooq",
      fallback: "Snapshot cadangan"
    },
    labels: {
      loading: "Memuat...",
      allMilestonesCleared: "Semua milestone tercapai",
      beyondCurrentPlan: "Di luar rencana saat ini",
      alreadyAchieved: "Sudah tercapai",
      adjustAges: "Sesuaikan usia",
      projectedValueAtTargetAge: "Nilai proyeksi pada usia target.",
      start: "Mulai",
      monthlyDeposits: "setoran bulanan",
      agePrefix: "Usia"
    },
    errors: {
      agesInvalid: "Usia harus berupa angka yang valid.",
      targetAgeGreater: "Usia target harus lebih besar dari usia sekarang."
    },
    investorLevels: [
      { minimum: 0, label: "Seed Starter", copy: "Kamu sedang membangun kebiasaan yang paling penting: tetap berinvestasi." },
      { minimum: 50000, label: "Momentum Builder", copy: "Portofoliomu sudah cukup besar untuk mulai terasa efek compounding." },
      { minimum: 100000, label: "Six-Figure Climber", copy: "Fondasinya sudah kuat. Sekarang waktu mulai bekerja lebih keras." },
      { minimum: 250000, label: "Compounding Operator", copy: "Uangmu mulai menghasilkan uang yang benar-benar terasa." },
      { minimum: 500000, label: "Half-Million Runner", copy: "Bola saljunya sudah cukup besar untuk mengubah pilihan masa depan." },
      { minimum: 1000000, label: "Millionaire Track", copy: "Kamu sudah masuk wilayah saat kesabaran bisa mengalahkan kerja keras." },
      { minimum: 2000000, label: "Freedom Engine", copy: "Compounding sudah menjadi mesin kekayaan yang serius." }
    ],
    achievements: {
      habitBuilderTitle: "Habit Builder",
      habitBuilderTarget: "Tetap investasi selama 10 tahun",
      habitBuilderUnlocked: (duration) => `${duration} sudah berjalan.`,
      habitBuilderLocked: (duration) => `${duration} baru terproyeksi saat ini.`,
      snowballTitle: "Snowball Activated",
      snowballTarget: "Keuntungan compounding melampaui 1 tahun DCA",
      snowballUnlocked: (duration) => `Tercapai setelah ${duration}.`,
      snowballLocked: "Belum tercapai di rencana ini.",
      doubleTitle: "Double the Day-One Stack",
      doubleTarget: "Portofolio menjadi 2x modal awal",
      doubleUnlocked: (age) => `Terbuka sekitar usia ${age}.`,
      doubleLocked: "Butuh waktu lebih lama atau DCA yang lebih besar.",
      doubleNeedsStarting: "Tambahkan modal awal untuk membuka badge ini.",
      sixFigureTitle: "Six-Figure Club",
      sixFigureTarget: "Capai $100.000",
      sixFigureUnlocked: "Enam digit tercapai.",
      sixFigureLocked: (remaining) => `${remaining} lagi untuk tercapai.`,
      halfMillionTitle: "Half-Million Run",
      halfMillionTarget: "Capai $500.000",
      halfMillionUnlocked: "Checkpoint setengah juta tercapai.",
      halfMillionLocked: (remaining) => `${remaining} lagi untuk tercapai.`,
      millionaireTitle: "Millionaire Track",
      millionaireTarget: "Capai $1.000.000",
      millionaireUnlocked: "Proyeksi sudah menyentuh tujuh digit.",
      millionaireLocked: (remaining) => `${remaining} lagi untuk tercapai.`,
      unlocked: "Terbuka",
      locked: "Terkunci"
    },
    journey: {
      timeInMarketLabel: "Waktu di pasar",
      timeInMarketCopy: (deposits, currentAge, targetAge) =>
        `${deposits} setoran bulanan dari usia ${currentAge} sampai ${targetAge}.`,
      snowballMomentLabel: "Momen snowball",
      snowballMomentValue: (age) => `Usia ${age}`,
      snowballMomentCopy: (dateLabel) =>
        `Keuntungan proyeksi setara satu tahun DCA pada ${dateLabel}.`,
      snowballMomentLocked: "Perpanjang horizon atau naikkan DCA untuk mengaktifkan snowball lebih cepat.",
      standoutCheckpointLabel: "Checkpoint utama",
      standoutCheckpointCopy: (dateLabel) => `Kemungkinan tercapai sekitar ${dateLabel}.`,
      standoutCheckpointFallback: (gainLabel) =>
        `Keuntungan proyeksi berakhir di ${gainLabel} saat finish.`,
      stillBuilding: "Masih dibangun"
    },
    templates: {
      futureSelfCopy: (age, balance, gain) =>
        `Pada usia ${age}, rencana ini memproyeksikan ${balance} dengan ${gain} berasal dari pertumbuhan.`,
      chartCaption: (startingAmount, monthlyContribution, duration) =>
        `Dimulai dari ${startingAmount} dan menambah ${monthlyContribution} per bulan selama ${duration}.`,
      depositCount: (months) => `${months} setoran bulanan`
    }
  }
};

const STORAGE_KEY = "compound-sp500-locale";

export function detectLocale(language = DEFAULT_LOCALE) {
  const normalized = String(language || DEFAULT_LOCALE).toLowerCase();
  return SUPPORTED_LOCALES.find((locale) => normalized.startsWith(locale)) || DEFAULT_LOCALE;
}

export function getPreferredLocale() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // Ignore unavailable localStorage access.
  }

  return detectLocale(window.navigator.language);
}

export function setPreferredLocale(locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch (error) {
    // Ignore unavailable localStorage access.
  }
}

export function getLocaleConfig(locale = DEFAULT_LOCALE) {
  return LOCALES[detectLocale(locale)];
}

export function formatCurrency(value, locale = DEFAULT_LOCALE) {
  return new Intl.NumberFormat(getLocaleConfig(locale).tag, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value, locale = DEFAULT_LOCALE) {
  const formatter = new Intl.NumberFormat(getLocaleConfig(locale).tag, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero"
  });
  return formatter.format(value);
}

export function formatNumber(value, locale = DEFAULT_LOCALE, options = {}) {
  return new Intl.NumberFormat(getLocaleConfig(locale).tag, options).format(value);
}

export function formatDate(value, locale = DEFAULT_LOCALE, options = {}) {
  return new Intl.DateTimeFormat(getLocaleConfig(locale).tag, options).format(
    value instanceof Date ? value : new Date(value)
  );
}

export function formatDuration(totalMonths, locale = DEFAULT_LOCALE) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (locale === "id") {
    if (years === 0) {
      return `${months} bulan`;
    }

    if (months === 0) {
      return `${years} tahun`;
    }

    return `${years} tahun, ${months} bulan`;
  }

  if (years === 0) {
    return `${months} months`;
  }

  if (months === 0) {
    return `${years} years`;
  }

  return `${years} years, ${months} months`;
}
