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
  Cloud,
  Sun,
  CloudRain,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { getFeed, type FeedStory } from "@/lib/yahoo-feed";

// --- Static / non-feed sections (weather, games, top cards stay as mock) ---

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

// --- Helper ---

function formatComments(n: number): string | null {
  if (!n) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function providerInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

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
            {"badge" in card && card.badge && (
              <span className={`text-[10px] font-bold ${"badgeColor" in card ? card.badgeColor : ""}`}>
                {card.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {"icon" in card && card.icon}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                {card.title}
              </p>
              {"subtitle" in card && card.subtitle && (
                <p
                  className={`text-xs text-gray-500 truncate ${"subtitleColor" in card ? card.subtitleColor ?? "" : ""}`}
                >
                  {card.subtitle}
                </p>
              )}
            </div>
            {"action" in card && card.action && (
              <div className="ml-auto">{card.action}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendingPanel({ stories }: { stories: FeedStory[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
        <h2 className="text-lg font-bold text-gray-900">Trending</h2>
      </div>
      <div className="flex flex-col gap-4">
        {stories.map((story, i) => (
          <a
            key={story.uuid}
            href={story.clickThroughUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group cursor-pointer"
          >
            <span className="text-sm font-bold text-gray-900 mt-1 w-4">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline">
                {story.title}
              </p>
            </div>
            {story.thumbnailSquareUrl && (
              <img
                src={story.thumbnailSquareUrl}
                alt=""
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </a>
        ))}
      </div>
      <button className="mt-4 text-sm font-semibold text-gray-900 hover:underline flex items-center gap-1">
        See more stories on Yahoo 100 <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function HeroCarousel({ story }: { story: FeedStory }) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-[16/10] group">
      <img
        src={story.thumbnailWideUrl ?? "https://placehold.co/800x500/1f2937/ffffff?text=News"}
        alt={story.title}
        className="w-full h-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-white/80 uppercase tracking-wide">
            {providerInitial(story.provider)}
          </span>
          <span className="text-xs text-white/80">{story.provider}</span>
          {story.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-white/80">
              <MessageCircle className="w-3 h-3" /> {formatComments(story.commentCount)}
            </span>
          )}
        </div>
        <a
          href={story.clickThroughUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-2xl md:text-3xl font-bold text-white leading-tight mb-4 hover:underline"
        >
          {story.title}
        </a>
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

function NewsGrid({ stories }: { stories: FeedStory[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      {stories.map((news) => (
        <a
          key={news.uuid}
          href={news.clickThroughUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group cursor-pointer"
        >
          <div className="rounded-xl overflow-hidden mb-2">
            <img
              src={news.thumbnailMediumUrl ?? "https://placehold.co/300x180/374151/ffffff?text=News"}
              alt=""
              className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:underline">
            {news.title}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {news.providerLogoUrl ? (
              <img
                src={news.providerLogoUrl}
                alt={news.provider}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <span className="w-5 h-5 rounded-full bg-gray-600 text-white text-[8px] font-bold flex items-center justify-center">
                {providerInitial(news.provider)}
              </span>
            )}
            <span className="text-xs text-gray-500">{news.provider}</span>
            {news.commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" /> {formatComments(news.commentCount)}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

function ForYouFeed({ stories }: { stories: FeedStory[] }) {
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
        {stories.map((story) => (
          <a
            key={story.uuid}
            href={story.clickThroughUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-pink-600">
                {story.category}
              </span>
              <h4 className="text-base font-bold text-gray-900 leading-snug mt-1 hover:underline">
                {story.title}
              </h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                {story.providerLogoUrl ? (
                  <img
                    src={story.providerLogoUrl}
                    alt={story.provider}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-[8px] font-bold flex items-center justify-center">
                    {providerInitial(story.provider)}
                  </span>
                )}
                <span>{story.provider}</span>
                {story.commentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {formatComments(story.commentCount)}
                  </span>
                )}
                {story.readTimeMin > 0 && (
                  <span>· {story.readTimeMin} min read</span>
                )}
              </div>
            </div>
            {story.thumbnailSquareUrl && (
              <img
                src={story.thumbnailSquareUrl}
                alt=""
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
            )}
          </a>
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
          <h4 className="text-white font-bold text-lg tracking-wide">BUILDING</h4>
          <p className="text-white/80 text-xs uppercase tracking-widest">High-Performance</p>
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

function BusinessPanel({ story }: { story: FeedStory }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
          $
        </div>
        <h2 className="text-lg font-bold text-gray-900">Business</h2>
      </div>
      <a
        href={story.clickThroughUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="rounded-xl overflow-hidden mb-2">
          <img
            src={story.thumbnailMediumUrl ?? "https://placehold.co/300x160/ea580c/ffffff?text=Business"}
            alt=""
            className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <h3 className="text-sm font-bold text-gray-900 leading-snug hover:underline cursor-pointer">
          {story.title}
        </h3>
      </a>
    </div>
  );
}

// --- Main Page ---

export default async function Home() {
  let feed;
  try {
    feed = await getFeed();
  } catch {
    feed = { stories: [], endCursor: "", hasNextPage: false };
  }

  const { stories } = feed;

  // Slice feed into sections
  const heroStory = stories[0];
  const newsGridStories = stories.slice(1, 4);
  const trendingStories = stories.slice(0, 5);
  const businessStory = stories[4] ?? stories[0];
  const forYouStories = stories.slice(5);

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
            <TrendingPanel stories={trendingStories} />
            {businessStory && <BusinessPanel story={businessStory} />}
          </div>

          {/* Center Column */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {heroStory && <HeroCarousel story={heroStory} />}
            {newsGridStories.length > 0 && <NewsGrid stories={newsGridStories} />}
            {forYouStories.length > 0 && <ForYouFeed stories={forYouStories} />}
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
