import Image from "next/image";
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MapPin,
  Play,
  Pause,
  VolumeX,
  List,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Cloud,
  Sun,
  CloudRain,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

// --- Mock Data ---

const topCards = [
  {
    id: 1,
    label: "Yahoo Scout",
    badge: "NEW!",
    badgeColor: "text-purple-600",
    title: "Which retail stores are closed on Easter Sunday in 2026?",
    icon: (
      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
        YS
      </div>
    ),
  },
  {
    id: 2,
    label: "What to play · Daily puzzle",
    title: "Crushable",
    subtitle: "Crush today's sweet level!",
    icon: (
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-yellow-300 flex items-center justify-center text-white font-bold text-xs">
        C
      </div>
    ),
  },
  {
    id: 3,
    label: "Events Near San Jose",
    title: "San Jose Sharks Vs. ...",
    subtitle: "7:00 PM · SAP Center...",
    icon: (
      <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-xs">
        SJ
      </div>
    ),
  },
  {
    id: 4,
    label: "Featured · 1st & 13",
    title: "Michigan 2",
    subtitle: "Texas 4",
    icon: (
      <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">
        M
      </div>
    ),
  },
  {
    id: 5,
    label: "Major Markets",
    title: "S&P 500 6,343.72",
    subtitle: "GSPC -0.39%",
    subtitleColor: "text-red-600",
    icon: (
      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
        $
      </div>
    ),
  },
  {
    id: 6,
    label: "Today in History",
    title: "'Jeopardy!' pre...",
    subtitle: "on NBC",
    action: <ArrowRight className="w-5 h-5 text-gray-400" />,
  },
];

const trendingStories = [
  {
    id: 1,
    rank: 1,
    title: "Tiger Woods faces fallout after DUI arrest",
    image: "https://placehold.co/60x60/e11d48/ffffff?text=TW",
  },
  {
    id: 2,
    rank: 2,
    title: "AI stock sell-off and oil crisis shake Wall Street",
    image: "https://placehold.co/60x60/1e40af/ffffff?text=AI",
    isNew: true,
  },
  {
    id: 3,
    rank: 3,
    title: "Air Canada CEO exits after language outcry",
    image: "https://placehold.co/60x60/047857/ffffff?text=AC",
  },
  {
    id: 4,
    rank: 4,
    title: "Supreme Court debate on birthright citizenship",
    image: "https://placehold.co/60x60/4b5563/ffffff?text=SC",
  },
  {
    id: 5,
    rank: 5,
    title: "Texas high school shooting leaves teacher injured",
    image: "https://placehold.co/60x60/92400e/ffffff?text=TX",
    isNew: true,
  },
];

const subNews = [
  {
    id: 1,
    title: "4 ways Iran could respond if the U.S. invades Kharg Island",
    source: "The Hill",
    comments: "4.8K",
    image: "https://placehold.co/300x180/1e3a8a/ffffff?text=Iran",
    sourceColor: "bg-blue-800",
  },
  {
    id: 2,
    title: "Kathie Lee Gifford gets frank on aging: 'Golden years? It's a lie.'",
    source: "Yahoo Entertainment",
    comments: null,
    image: "https://placehold.co/300x180/831843/ffffff?text=KG",
    sourceColor: "bg-purple-600",
  },
  {
    id: 3,
    title: "Duke coach Jon Scheyer creates instant meme after UConn's wild buzzer-beater",
    source: "Yahoo Sports",
    comments: "406",
    image: "https://placehold.co/300x180/14532d/ffffff?text=Duke",
    sourceColor: "bg-green-700",
  },
];

const forYouStories = [
  {
    id: 1,
    category: "Celebrity",
    categoryColor: "text-pink-600",
    title: "Howie Mandel struggles through Kelly Ripa apology, says he doesn't...",
    source: "Entertainment W...",
    comments: "1.2K",
    readTime: "3 min read",
    image: "https://placehold.co/120x120/b45309/ffffff?text=HM",
  },
];

const games = [
  {
    id: 1,
    title: "Crushable",
    subtitle: "From Candy Crush",
    badge: "Daily game",
    image: "https://placehold.co/60x60/f472b6/ffffff?text=C",
  },
  {
    id: 2,
    title: "Yahoo IQ Trivia",
    subtitle: "19.2K people playing",
    badge: "New features",
    image: "https://placehold.co/60x60/8b5cf6/ffffff?text=IQ",
  },
];

// --- Components ---

function TopCardRow() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {topCards.map((card) => (
        <div
          key={card.id}
          className="flex-shrink-0 w-56 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] text-gray-500 font-medium truncate">
              {card.label}
            </span>
            {card.badge && (
              <span className={`text-[10px] font-bold ${card.badgeColor}`}>
                {card.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {card.icon}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                {card.title}
              </p>
              {card.subtitle && (
                <p
                  className={`text-xs text-gray-500 truncate ${
                    card.subtitleColor || ""
                  }`}
                >
                  {card.subtitle}
                </p>
              )}
            </div>
            {card.action && <div className="ml-auto">{card.action}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
        <h2 className="text-lg font-bold text-gray-900">Trending</h2>
      </div>
      <div className="flex flex-col gap-4">
        {trendingStories.map((story) => (
          <div key={story.id} className="flex items-start gap-3 group cursor-pointer">
            <span className="text-sm font-bold text-gray-900 mt-1 w-4">
              {story.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
                {story.title}
              </p>
              {story.isNew && (
                <span className="inline-block mt-1 text-[10px] font-bold bg-yellow-300 text-black px-1.5 py-0.5 rounded">
                  New
                </span>
              )}
            </div>
            <img
              src={story.image}
              alt=""
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          </div>
        ))}
      </div>
      <button className="mt-4 text-sm font-semibold text-gray-900 hover:underline flex items-center gap-1">
        See more stories on Yahoo 100 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function HeroCarousel() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/10] group">
      <img
        src="https://placehold.co/800x500/1f2937/ffffff?text=Hero+Image"
        alt="Hero"
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <span className="text-xs text-white/90 bg-black/40 px-2 py-1 rounded-full">
          4 of 15
        </span>
        <button className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
            wp
          </span>
          <span className="text-xs text-white/80">Washington Post</span>
          <span className="flex items-center gap-1 text-xs text-white/80">
            <MessageCircle className="w-3 h-3" /> 267
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
          Trump allies cheer as the Ellisons expand their media empire
        </h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      {subNews.map((news) => (
        <div key={news.id} className="group cursor-pointer">
          <div className="rounded-xl overflow-hidden mb-2">
            <img
              src={news.image}
              alt=""
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:underline">
            {news.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-5 h-5 rounded-full ${news.sourceColor} text-white text-[8px] font-bold flex items-center justify-center`}
            >
              {news.source[0]}
            </span>
            <span className="text-xs text-gray-500">{news.source}</span>
            {news.comments && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" /> {news.comments}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ForYouFeed() {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">For You</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Feed view</span>
          <button className="p-1.5 rounded-md bg-gray-100 text-gray-700">
            <List className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-50">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {forYouStories.map((story) => (
          <div
            key={story.id}
            className="flex gap-4 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-bold ${story.categoryColor}`}>
                {story.category}
              </span>
              <h4 className="text-base font-bold text-gray-900 leading-snug mt-1 hover:underline">
                {story.title}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[8px] font-bold flex items-center justify-center">
                  EW
                </span>
                <span>{story.source}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> {story.comments}
                </span>
                <span>· {story.readTime}</span>
              </div>
            </div>
            <img
              src={story.image}
              alt=""
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherWidget() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-500 tracking-wider">
          WEATHER
        </span>
        <button className="flex items-center gap-1 text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200">
          San Jose <MapPin className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Cloud className="w-14 h-14 text-gray-700" />
        <div>
          <div className="text-4xl font-light text-gray-900">78°</div>
          <div className="text-sm text-gray-500">RealFeel® 76°, Cloudy</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Today</div>
          <Sun className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
          <div className="text-xs font-semibold text-gray-900">80° 56°</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Tomorrow</div>
          <CloudRain className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <div className="text-xs font-semibold text-gray-900">75° 54°</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Wed</div>
          <Sun className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
          <div className="text-xs font-semibold text-gray-900">67° 52°</div>
        </div>
      </div>
      <div className="text-[10px] text-gray-400 text-center mb-3">
        Powered by AccuWeather
      </div>
      <button className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800">
        Check UV, air quality and more
      </button>
    </div>
  );
}

function VideoAd() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video group">
      <img
        src="https://placehold.co/400x225/111827/ffffff?text=Video+Ad"
        alt="Ad"
        className="w-full h-full object-cover opacity-60"
      />
      <div className="absolute top-2 left-2">
        <span className="text-[10px] font-bold text-white bg-green-600 px-1.5 py-0.5 rounded">
          Ad: 00:27
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h4 className="text-white font-bold text-lg tracking-wide">
            BUILDING
          </h4>
          <p className="text-white/80 text-xs uppercase tracking-widest">
            High-Performance
          </p>
          <h3 className="text-white font-bold text-2xl">TEAMS</h3>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-3">
        <button className="text-white hover:text-gray-300">
          <Pause className="w-5 h-5" />
        </button>
        <button className="text-white hover:text-gray-300">
          <VolumeX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function PopularGames() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-1 mb-3">
        <h3 className="text-base font-bold text-gray-900">Popular Games</h3>
        <ArrowRight className="w-4 h-4 text-purple-600" />
      </div>
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <div key={game.id} className="flex items-center gap-3 cursor-pointer group">
            <img
              src={game.image}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {game.badge}
              </span>
              <p className="text-sm font-bold text-gray-900 group-hover:underline">
                {game.title}
              </p>
              <p className="text-xs text-gray-500">{game.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessPanel() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
          $
        </div>
        <h2 className="text-lg font-bold text-gray-900">Business</h2>
      </div>
      <div className="rounded-xl overflow-hidden mb-2">
        <img
          src="https://placehold.co/300x160/ea580c/ffffff?text=Olive+Garden"
          alt=""
          className="w-full h-36 object-cover"
        />
      </div>
      <h3 className="text-sm font-bold text-gray-900 leading-snug hover:underline cursor-pointer">
        When My Career Stalled, I Got A Job At Olive Garden. I Was Shocked By What I...
      </h3>
    </div>
  );
}

// --- Main Page ---

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Cards */}
        <section className="mb-6">
          <TopCardRow />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <TrendingPanel />
            <BusinessPanel />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <HeroCarousel />
            <NewsGrid />
            <ForYouFeed />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <WeatherWidget />
            <VideoAd />
            <PopularGames />
          </div>
        </div>
      </main>
    </div>
  );
}
