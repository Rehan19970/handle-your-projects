import { Link, useNavigate } from 'react-router-dom';
import {
    Layers, CheckCircle2, Zap, Shield, BarChart3, ArrowRight, Play, Sparkles,
    Workflow, Users, Lock, Globe, Plus, Minus, Menu, X, Star, Check,
    KeyRound, FileCheck2, Server, Clock, TrendingUp,
    MessageSquare, Mic, Image as ImageIcon, Paperclip, Send, Smile, CheckCheck,
    Pin, Search, AtSign, Reply, Hash, BellRing, Gauge, WifiOff, Pencil,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    motion, useScroll, useSpring, useTransform, useInView,
    useReducedMotion, AnimatePresence, animate,
} from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';

/* -------------------------------------------------------------------------- */
/*  Reusable animation helpers                                                */
/* -------------------------------------------------------------------------- */

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, y = 32, className = '', as = 'div' }) {
    const reduce = useReducedMotion();
    const Tag = motion[as];
    return (
        <Tag
            className={className}
            initial={reduce ? false : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay, ease }}
        >
            {children}
        </Tag>
    );
}

function Stagger({ children, className = '', gap = 0.08 }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
        >
            {children}
        </motion.div>
    );
}

const item = {
    hidden: { opacity: 0, y: 28, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease } },
};

function Counter({ to, suffix = '', prefix = '', decimals = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 2,
            ease: 'easeOut',
            onUpdate: (v) => setVal(v),
        });
        return () => controls.stop();
    }, [inView, to]);
    return (
        <span ref={ref}>
            {prefix}{val.toFixed(decimals)}{suffix}
        </span>
    );
}

function SectionHeading({ eyebrow, title, subtitle }) {
    return (
        <Reveal className="text-center max-w-3xl mx-auto mb-10 md:mb-16 px-1">
            <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3 md:mb-4">
                {eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 md:mt-5 text-base md:text-lg text-slate-600 dark:text-slate-400">{subtitle}</p>
            )}
        </Reveal>
    );
}

/* -------------------------------------------------------------------------- */
/*  Hero product mockup                                                       */
/* -------------------------------------------------------------------------- */

const mockColumns = [
    { name: 'To Do', color: 'bg-slate-400', cards: [
        { t: 'Design onboarding flow', tag: 'Design', c: 'bg-pink-500' },
        { t: 'Write API documentation', tag: 'Docs', c: 'bg-amber-500' },
    ] },
    { name: 'In Progress', color: 'bg-indigo-500', cards: [
        { t: 'Integrate Stripe billing', tag: 'Backend', c: 'bg-indigo-500' },
        { t: 'Realtime notifications', tag: 'Feature', c: 'bg-emerald-500' },
        { t: 'Fix mobile sidebar', tag: 'Bug', c: 'bg-red-500' },
    ] },
    { name: 'Review', color: 'bg-amber-500', cards: [
        { t: 'Analytics dashboard v2', tag: 'Feature', c: 'bg-emerald-500' },
    ] },
    { name: 'Done', color: 'bg-emerald-500', cards: [
        { t: 'Google OAuth login', tag: 'Auth', c: 'bg-purple-500' },
        { t: 'Role-based access', tag: 'Security', c: 'bg-cyan-500' },
    ] },
];

function BoardMockup() {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/10 overflow-hidden">
            <div className="flex items-center gap-2 px-3 md:px-4 h-10 md:h-11 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-emerald-400" />
                <div className="ml-2 md:ml-4 hidden sm:flex items-center gap-2 text-[10px] md:text-xs text-slate-500 bg-white dark:bg-slate-800 rounded-md px-2 md:px-3 py-1 border border-slate-200 dark:border-slate-700 truncate">
                    <Lock className="h-3 w-3 shrink-0" /> <span className="truncate">app.taskforge.io/board/product-launch</span>
                </div>
            </div>
            <div className="flex">
                <aside className="hidden md:block w-36 lg:w-48 border-r border-slate-200 dark:border-slate-800 p-3 lg:p-4 space-y-1.5 lg:space-y-2 bg-slate-50/60 dark:bg-slate-900/60">
                    {['Dashboard', 'My Tasks', 'Boards', 'Analytics', 'Automations', 'Team'].map((l, i) => (
                        <div key={l} className={`text-xs lg:text-sm px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg truncate ${i === 2 ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                            {l}
                        </div>
                    ))}
                </aside>
                <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-5 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 bg-slate-50/40 dark:bg-slate-950/40">
                    {mockColumns.map((col, ci) => (
                        <div key={col.name} className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span className={`h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full ${col.color}`} />
                                <span className="truncate">{col.name}</span>
                                <span className="ml-auto text-slate-400 shrink-0">{col.cards.length}</span>
                            </div>
                            {col.cards.map((c, i) => (
                                <motion.div
                                    key={c.t}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + ci * 0.12 + i * 0.1, duration: 0.5, ease }}
                                    className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 sm:p-3 shadow-sm"
                                >
                                    <span className={`inline-block h-1 sm:h-1.5 w-6 sm:w-8 rounded-full ${c.c} mb-1.5 sm:mb-2`} />
                                    <p className="text-[10px] sm:text-xs font-medium text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{c.t}</p>
                                    <div className="mt-2 sm:mt-3 flex items-center justify-between">
                                        <span className="text-[9px] sm:text-[10px] text-slate-500 truncate">{c.tag}</span>
                                        <span className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  Live chat mockup                                                          */
/* -------------------------------------------------------------------------- */

function Waveform({ playing = false }) {
    const reduce = useReducedMotion();
    const bars = [6, 12, 8, 16, 10, 18, 7, 14, 20, 9, 15, 8, 17, 11, 6, 13, 9, 16, 7, 12];
    return (
        <div className="flex items-center gap-[2px] sm:gap-[3px] h-5 sm:h-6">
            {bars.map((h, i) => (
                <motion.span
                    key={i}
                    className="w-[2px] sm:w-[3px] rounded-full bg-current opacity-80"
                    style={{ height: h }}
                    animate={playing && !reduce ? { scaleY: [1, 0.35, 1] } : {}}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.05 }}
                />
            ))}
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
            ))}
        </div>
    );
}

function Bubble({ me, delay, children, time, seen, reaction }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay, ease }}
            className={`flex ${me ? 'justify-end' : 'justify-start'}`}
        >
            <div className="relative max-w-[88%] sm:max-w-[82%]">
                <div
                    className={`px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm shadow-sm ${
                        me
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md'
                    }`}
                >
                    {children}
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] sm:text-[10px] ${me ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {time}
                        {me && <CheckCheck className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${seen ? 'text-sky-300' : ''}`} />}
                    </div>
                </div>
                {reaction && (
                    <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: delay + 0.5, type: 'spring', stiffness: 500, damping: 18 }}
                        className={`absolute -bottom-3 ${me ? 'left-2' : 'right-2'} text-[10px] sm:text-xs bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-1.5 py-0.5 shadow`}
                    >
                        {reaction}
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
}

function ChatMockup() {
    const channels = [
        { n: 'product-launch', unread: 3 },
        { n: 'design-team', unread: 0 },
        { n: 'backend', unread: 12 },
    ];
    const people = [
        { n: 'Ayesha K.', on: true },
        { n: 'Hamza R.', on: true },
        { n: 'Sara M.', on: false },
    ];
    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/10 overflow-hidden flex h-[460px] sm:h-[520px] md:h-[560px]">
            {/* sidebar */}
            <aside className="hidden md:flex w-44 lg:w-52 flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
                <div className="p-2.5 lg:p-3">
                    <div className="flex items-center gap-2 text-[11px] lg:text-xs text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 lg:px-3 py-1.5 lg:py-2">
                        <Search className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0" /> <span className="truncate">Search messages</span>
                    </div>
                </div>
                <p className="px-3 lg:px-4 pt-2 pb-1 text-[9px] lg:text-[10px] font-semibold uppercase tracking-wider text-slate-400">Channels</p>
                {channels.map((c, i) => (
                    <div key={c.n} className={`mx-1.5 lg:mx-2 flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm ${i === 0 ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                        <Hash className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0" />
                        <span className="truncate">{c.n}</span>
                        {c.unread > 0 && (
                            <span className={`ml-auto text-[9px] lg:text-[10px] font-bold rounded-full px-1.5 shrink-0 ${i === 0 ? 'bg-white/25' : 'bg-indigo-600 text-white'}`}>{c.unread}</span>
                        )}
                    </div>
                ))}
                <p className="px-3 lg:px-4 pt-4 lg:pt-5 pb-1 text-[9px] lg:text-[10px] font-semibold uppercase tracking-wider text-slate-400">Direct messages</p>
                {people.map((p) => (
                    <div key={p.n} className="mx-1.5 lg:mx-2 flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-slate-600 dark:text-slate-300">
                        <span className="relative h-5 w-5 lg:h-6 lg:w-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0">
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full ring-2 ring-slate-50 dark:ring-slate-900 ${p.on ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        </span>
                        <span className="truncate">{p.n}</span>
                    </div>
                ))}
            </aside>

            {/* conversation */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-12 sm:h-14 border-b border-slate-200 dark:border-slate-800">
                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0">PL</div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold truncate"># product-launch</p>
                        <p className="text-[10px] sm:text-[11px] text-emerald-500 truncate">Ayesha is typing…</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2 sm:gap-3 text-slate-400 shrink-0">
                        <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.08)_1px,transparent_0)] [background-size:18px_18px] bg-slate-50/60 dark:bg-slate-950/40">
                    <Bubble delay={0.1} time="10:24">
                        <p className="text-[10px] sm:text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">Ayesha</p>
                        Homepage design is ready for review 🎨
                    </Bubble>

                    <Bubble me delay={0.5} time="10:25" seen>
                        <div className="w-44 sm:w-52 h-24 sm:h-28 rounded-xl bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 mb-1.5 flex items-center justify-center">
                            <ImageIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white/90" />
                        </div>
                        <p>New hero concept v2</p>
                    </Bubble>

                    <Bubble delay={0.9} time="10:26">
                        <div className="flex items-center gap-2 sm:gap-3 w-48 sm:w-56">
                            <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </span>
                            <div className="text-indigo-600 dark:text-indigo-400"><Waveform playing /></div>
                            <span className="text-[10px] sm:text-[11px] text-slate-500 ml-auto shrink-0">0:18</span>
                        </div>
                    </Bubble>

                    <Bubble me delay={1.3} time="10:27" seen reaction="🔥">
                        Looks great! Moving it to Review now ✅
                    </Bubble>

                    <Bubble delay={1.7} time="10:27">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                            <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-500" />
                            <span className="font-medium">Linked task</span>
                        </div>
                        <div className="mt-1.5 rounded-lg border border-slate-200 dark:border-slate-600 p-2 sm:p-2.5 w-44 sm:w-52 bg-slate-50 dark:bg-slate-900">
                            <p className="text-[11px] sm:text-xs font-semibold">Analytics dashboard v2</p>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">In Review · @hamza</p>
                        </div>
                    </Bubble>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2.1 }}
                    >
                        <TypingDots />
                    </motion.div>
                </div>

                {/* composer */}
                <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 sm:gap-2">
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                    <div className="flex-1 flex items-center gap-1.5 sm:gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-400 min-w-0">
                        <span className="truncate">Message #product-launch</span>
                        <AtSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto shrink-0" />
                        <Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    </div>
                    <span className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </span>
                </div>
            </div>
        </div>
    );
}

const chatFeatures = [
    { icon: Mic, title: 'Voice messages', desc: 'Hold to record, live waveform, playback at 1x / 1.5x / 2x speed.' },
    { icon: ImageIcon, title: 'Images and files', desc: 'Drag and drop, automatic compression, instant previews and galleries.' },
    { icon: CheckCheck, title: 'Read receipts and presence', desc: 'Sent, delivered and seen states, with live online and typing indicators.' },
    { icon: Smile, title: 'Reactions and threads', desc: 'React with emoji, reply in threads and keep long discussions organized.' },
    { icon: AtSign, title: 'Mentions and task links', desc: 'Tag teammates with @mentions and attach any task straight into the conversation.' },
    { icon: Search, title: 'Search, pin and star', desc: 'Find any message instantly and pin the important ones to the channel.' },
    { icon: Pencil, title: 'Edit and delete', desc: 'Fix typos or remove messages, and everyone sees the change in real time.' },
    { icon: BellRing, title: 'Smart notifications', desc: 'Unread badges, mention alerts and per-channel mute controls.' },
];

const chatTech = [
    { icon: Gauge, label: 'Instant delivery', desc: 'Socket.io rooms per board and channel' },
    { icon: Send, label: 'Optimistic UI', desc: 'Messages appear immediately, confirmed by server ack' },
    { icon: WifiOff, label: 'Offline-safe', desc: 'Unsent messages queue and retry on reconnect' },
    { icon: Lock, label: 'Secure media', desc: 'Signed uploads and permission-checked access' },
];

const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Live Chat', href: '#chat' },
    { label: 'How it works', href: '#how' },
    { label: 'Security', href: '#security' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
];

const logos = ['Northwind', 'Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Labs', 'Wayne Tech'];

const stats = [
    { to: 12, suffix: 'k+', label: 'Teams onboarded' },
    { to: 3.4, suffix: 'M', decimals: 1, label: 'Tasks completed' },
    { to: 99.99, suffix: '%', decimals: 2, label: 'Uptime SLA' },
    { to: 38, suffix: '%', label: 'Faster delivery' },
];

const steps = [
    { icon: Layers, title: 'Create your workspace', desc: 'Invite your team, set roles and spin up boards from templates in under two minutes.' },
    { icon: Workflow, title: 'Automate the busywork', desc: 'Build If/Then rules so tasks move, assign and notify on their own.' },
    { icon: Sparkles, title: 'Let AI do the heavy lifting', desc: 'Generate descriptions, break work into sub-tasks and summarize progress in one click.' },
    { icon: TrendingUp, title: 'Measure and improve', desc: 'Track velocity, bottlenecks and completion trends with live analytics.' },
];

const tabs = [
    { id: 'kanban', label: 'Kanban', icon: Layers, title: 'Boards that feel instant', desc: 'Drag and drop with fractional ordering means no reload, no lag, no lost positions, even with thousands of cards.', points: ['Unlimited boards and columns', 'Custom fields and labels', 'Swimlanes and WIP limits'] },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, title: 'Your built-in project copilot', desc: 'Describe the goal and TaskForge drafts the task, acceptance criteria and sub-tasks for you.', points: ['One-click task generation', 'Smart sub-task breakdown', 'Progress summaries for stakeholders'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, title: 'Insights, not just charts', desc: 'See where work gets stuck and who is overloaded before deadlines slip.', points: ['Burndown and velocity', 'Workload balancing', 'Exportable reports'] },
    { id: 'automation', label: 'Automation', icon: Workflow, title: 'No-code workflow rules', desc: 'When a card hits Review, assign the lead, set a due date and ping the channel. Automatically.', points: ['Trigger / condition / action builder', 'Scheduled and event rules', 'Full run history'] },
];

const bento = [
    { icon: Zap, title: 'AI-Powered', desc: 'Generate task descriptions and sub-tasks with one click.', span: 'md:col-span-2' },
    { icon: Layers, title: 'Real-time Sync', desc: 'Every change appears instantly for everyone via Socket.io.', span: '' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Track team performance and completion trends with beautiful charts.', span: '' },
    { icon: CheckCircle2, title: 'Automation Rules', desc: 'Set up If/Then logic to automate your entire workflow.', span: '' },
    { icon: Shield, title: 'Enterprise Security', desc: '2FA, Google OAuth and granular role-based access control.', span: 'md:col-span-2' },
];

const securityItems = [
    { icon: KeyRound, title: '2FA and SSO-ready', desc: 'Authenticator-based 2FA and Google OAuth out of the box.' },
    { icon: Users, title: 'Granular RBAC', desc: 'Owner, admin, member and viewer roles with per-board permissions.' },
    { icon: Server, title: 'Encrypted everywhere', desc: 'TLS in transit and encryption at rest for all workspace data.' },
    { icon: FileCheck2, title: 'Audit logs', desc: 'Every sensitive action is recorded and exportable for compliance.' },
];

const testimonials = [
    { q: 'We replaced three tools with TaskForge. Sprint planning went from two hours to twenty minutes.', n: 'Sarah Mitchell', r: 'VP Engineering, Northwind' },
    { q: 'The automation rules alone saved our ops team about 15 hours a week. Setup was painless.', n: 'Daniel Okafor', r: 'Head of Operations, Globex' },
    { q: 'Finally a board tool that stays fast at scale. Real-time sync just works.', n: 'Priya Sharma', r: 'CTO, Stark Labs' },
];

const plans = [
    { name: 'Starter', m: 0, y: 0, desc: 'For individuals and small side projects.', cta: 'Start for Free', feats: ['Up to 3 boards', '5 team members', 'Basic analytics', 'Community support'] },
    { name: 'Pro', m: 12, y: 9, desc: 'For growing teams that need power.', cta: 'Start Pro Trial', popular: true, feats: ['Unlimited boards', 'AI task assistant', 'Automation rules', 'Advanced analytics', 'Priority support'] },
    { name: 'Enterprise', m: null, y: null, desc: 'For organizations with advanced needs.', cta: 'Contact Sales', feats: ['Everything in Pro', 'SSO and audit logs', 'Custom roles and RBAC', 'Dedicated success manager', '99.99% uptime SLA'] },
];

const faqs = [
    { q: 'Is there a free plan?', a: 'Yes. The Starter plan is free forever for small teams. You can upgrade any time as you grow.' },
    { q: 'How does the AI assistant work?', a: 'Describe what you need and TaskForge drafts task descriptions and sub-tasks for you to review and edit before saving.' },
    { q: 'Is my data secure?', a: 'Data is encrypted in transit and at rest, with 2FA, role-based access control and audit logs available for your team.' },
    { q: 'Can I try it without signing up?', a: 'Absolutely. Click "Try Live Demo" to explore a fully populated workspace instantly, no account needed.' },
    { q: 'Can I cancel anytime?', a: 'Yes. There are no long-term contracts on Starter or Pro. Cancel from your billing settings whenever you want.' },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('kanban');
    const [yearly, setYearly] = useState(true);
    const [openFaq, setOpenFaq] = useState(0);
    const reduce = useReducedMotion();

    /* scroll progress bar */
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

    /* hero parallax */
    const heroRef = useRef(null);
    const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const mockY = useTransform(heroP, [0, 1], [0, reduce ? 0 : 120]);
    const mockRotate = useTransform(heroP, [0, 0.6], [reduce ? 0 : 12, 0]);
    const glowY = useTransform(heroP, [0, 1], [0, reduce ? 0 : -80]);
    const heroOpacity = useTransform(heroP, [0, 0.9], [1, 0.2]);

    /* how-it-works scroll-linked line */
    const howRef = useRef(null);
    const { scrollYProgress: howP } = useScroll({ target: howRef, offset: ['start 70%', 'end 60%'] });
    const lineScale = useTransform(howP, [0, 1], [0, 1]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            const res = await api.post('/auth/demo-login');
            login(res.data.user, res.data.accessToken);
            toast.success('Welcome to the Demo!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Demo login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const tab = tabs.find((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-x-hidden scroll-smooth">
            {/* Scroll progress */}
            <motion.div
                style={{ scaleX: progress }}
                className="fixed top-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[60]"
            />

            {/* ------------------------------- Navbar ------------------------------- */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <a href="#top" className="flex items-center gap-2 font-bold text-lg sm:text-xl shrink-0">
                        <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </span>
                        TaskForge
                    </a>

                    <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                        {navLinks.map((l) => (
                            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                {l.label}
                            </a>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600">Log in</Link>
                        <Link to="/register"><Button size="sm">Get Started</Button></Link>
                    </div>

                    <button className="lg:hidden p-2 -mr-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
                        {menuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                    </button>
                </div>

                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
                        >
                            <div className="px-4 sm:px-6 py-4 flex flex-col gap-3">
                                {navLinks.map((l) => (
                                    <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-sm text-slate-700 dark:text-slate-200 font-medium py-1">
                                        {l.label}
                                    </a>
                                ))}
                                <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                    <Link to="/login" className="flex-1 text-center py-2 text-sm text-slate-700 dark:text-slate-200 font-medium">Log in</Link>
                                    <Link to="/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* -------------------------------- Hero -------------------------------- */}
            <section id="top" ref={heroRef} className="relative pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6">
                {/* background */}
                <motion.div style={{ y: glowY }} className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f114_1px,transparent_1px),linear-gradient(to_bottom,#6366f114_1px,transparent_1px)] bg-[size:32px_32px] sm:bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
                    <motion.div
                        animate={reduce ? {} : { scale: [1, 1.15, 1], x: [0, 30, 0] }}
                        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-20 left-1/4 h-[300px] w-[300px] sm:h-[460px] sm:w-[460px] rounded-full bg-indigo-500/25 blur-[100px] sm:blur-[120px]"
                    />
                    <motion.div
                        animate={reduce ? {} : { scale: [1, 1.2, 1], x: [0, -40, 0] }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-20 right-1/4 h-[280px] w-[280px] sm:h-[420px] sm:w-[420px] rounded-full bg-purple-500/25 blur-[100px] sm:blur-[120px]"
                    />
                </motion.div>

                <motion.div style={{ opacity: heroOpacity }} className="max-w-7xl mx-auto text-center">
                    <motion.a
                        href="#features"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease }}
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[11px] sm:text-sm font-medium mb-6 sm:mb-8 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                    >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">New: AI task assistant is live</span>
                        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    </motion.a>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1, ease }}
                        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-6 px-1"
                    >
                        Manage your team's work <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                            without the chaos.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.25, ease }}
                        className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-1"
                    >
                        TaskForge is the visual workspace for teams that want to get things done.
                        Kanban boards, real-time sync, AI automation and powerful analytics, in one secure platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2"
                    >
                        <Button onClick={handleDemoLogin} isLoading={isLoading} size="lg" className="w-full sm:w-auto px-6 sm:px-8">
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Try Live Demo
                        </Button>
                        <Link to="/register" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full px-6 sm:px-8">
                                Start for Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-5 sm:mt-6 text-xs sm:text-sm text-slate-500 px-2"
                    >
                        No credit card required · Free plan forever · Setup in 2 minutes
                    </motion.p>
                </motion.div>

                {/* mockup with scroll tilt */}
                <div className="max-w-6xl mx-auto mt-10 sm:mt-14 md:mt-16 lg:mt-20 px-1 sm:px-0" style={{ perspective: 1600 }}>
                    <motion.div
                        style={{ y: mockY, rotateX: mockRotate, transformOrigin: 'center top' }}
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5, ease }}
                        className="relative"
                    >
                        <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-2xl sm:blur-3xl -z-10 rounded-[2rem]" />
                        <BoardMockup />

                        {/* floating chips — hidden on small screens to avoid overflow */}
                        <motion.div
                            animate={reduce ? {} : { y: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                            className="hidden lg:flex absolute -left-6 xl:-left-8 top-24 items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 xl:px-4 py-2.5 xl:py-3 shadow-xl"
                        >
                            <span className="h-8 w-8 xl:h-9 xl:w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="h-4 w-4 xl:h-5 xl:w-5 text-emerald-600" />
                            </span>
                            <div className="text-left">
                                <p className="text-[10px] xl:text-xs text-slate-500">Sprint progress</p>
                                <p className="text-xs xl:text-sm font-semibold">87% complete</p>
                            </div>
                        </motion.div>
                        <motion.div
                            animate={reduce ? {} : { y: [0, 12, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="hidden lg:flex absolute -right-4 xl:-right-6 bottom-20 items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 xl:px-4 py-2.5 xl:py-3 shadow-xl"
                        >
                            <span className="h-8 w-8 xl:h-9 xl:w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                                <Sparkles className="h-4 w-4 xl:h-5 xl:w-5 text-indigo-600" />
                            </span>
                            <div className="text-left">
                                <p className="text-[10px] xl:text-xs text-slate-500">AI generated</p>
                                <p className="text-xs xl:text-sm font-semibold">5 sub-tasks added</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ----------------------------- Logo marquee ---------------------------- */}
            <section className="py-10 sm:py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <Reveal>
                    <p className="text-center text-xs sm:text-sm font-medium text-slate-500 mb-6 sm:mb-8 px-4">
                        Trusted by fast-moving teams around the world
                    </p>
                </Reveal>
                <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
                    <motion.div
                        className="flex gap-8 sm:gap-16 w-max"
                        animate={reduce ? {} : { x: ['0%', '-50%'] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    >
                        {[...logos, ...logos].map((l, i) => (
                            <span key={i} className="text-lg sm:text-2xl font-bold text-slate-300 dark:text-slate-700 whitespace-nowrap select-none">
                                {l}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --------------------------------- Stats -------------------------------- */}
            <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
                <Stagger className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {stats.map((s) => (
                        <motion.div key={s.label} variants={item} className="text-center">
                            <p className="text-2xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                <Counter to={s.to} suffix={s.suffix} decimals={s.decimals || 0} />
                            </p>
                            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{s.label}</p>
                        </motion.div>
                    ))}
                </Stagger>
            </section>

            {/* ------------------------------ Features (bento) ------------------------ */}
            <section id="features" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        eyebrow="Features"
                        title="Everything you need to ship faster"
                        subtitle="One platform replaces your boards, docs, automations and reporting tools."
                    />
                    <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {bento.map((f) => (
                            <motion.div
                                key={f.title}
                                variants={item}
                                whileHover={reduce ? {} : { y: -6 }}
                                className={`group relative overflow-hidden p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all ${f.span}`}
                            >
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                                <div className="relative">
                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-indigo-500/30">
                                        <f.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2">{f.title}</h3>
                                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ------------------------------ Product tabs ---------------------------- */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        eyebrow="Product"
                        title="Built for how modern teams actually work"
                        subtitle="Explore the tools your team will use every day."
                    />

                    <Reveal className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-12">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                                    activeTab === t.id
                                        ? 'text-white'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {activeTab === t.id && (
                                    <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-indigo-600" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5 sm:gap-2"><t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />{t.label}</span>
                            </button>
                        ))}
                    </Reveal>

                    <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 24 }}
                                transition={{ duration: 0.35, ease }}
                            >
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{tab.title}</h3>
                                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">{tab.desc}</p>
                                <ul className="space-y-3 sm:space-y-4">
                                    {tab.points.map((p) => (
                                        <li key={p} className="flex items-start gap-2.5 sm:gap-3">
                                            <span className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                                            </span>
                                            <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300">{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </AnimatePresence>

                        <Reveal>
                            <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-8 min-h-[240px] sm:min-h-[320px] flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.2),transparent_55%)]" />
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={tab.id}
                                        initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        exit={{ opacity: 0, scale: 0.85, rotate: 6 }}
                                        transition={{ duration: 0.4, ease }}
                                        className="relative h-28 w-28 sm:h-40 sm:w-40 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
                                    >
                                        <tab.icon className="h-14 w-14 sm:h-20 sm:w-20 text-white" />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* --------------------------------- Live chat ------------------------------ */}
            <section id="chat" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
                <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
                <div className="relative max-w-7xl mx-auto">
                    <SectionHeading
                        eyebrow="Live Chat"
                        title="Team chat built right into your workspace"
                        subtitle="Voice notes, images, threads and task links, so conversations and work live in one place instead of five apps."
                    />

                    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 sm:gap-12 items-start">
                        <Reveal>
                            <ChatMockup />
                        </Reveal>

                        <div>
                            <Stagger className="grid sm:grid-cols-2 gap-3 sm:gap-4" gap={0.06}>
                                {chatFeatures.map((f) => (
                                    <motion.div
                                        key={f.title}
                                        variants={item}
                                        whileHover={reduce ? {} : { y: -4 }}
                                        className="p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                                    >
                                        <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2.5 sm:mb-3">
                                            <f.icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                                        </span>
                                        <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                    </motion.div>
                                ))}
                            </Stagger>
                        </div>
                    </div>

                    {/* under the hood */}
                    <Reveal className="mt-10 sm:mt-16">
                        <p className="text-center text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-slate-500 mb-4 sm:mb-6">Under the hood</p>
                        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {chatTech.map((t) => (
                                <motion.div
                                    key={t.label}
                                    variants={item}
                                    className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                                >
                                    <t.icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-semibold">{t.label}</p>
                                        <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">{t.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </Stagger>
                    </Reveal>
                </div>
            </section>

            {/* ---------------------------- How it works ------------------------------ */}
            <section id="how" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.25),transparent_60%)]" />
                <div ref={howRef} className="relative max-w-4xl mx-auto">
                    <Reveal className="text-center mb-12 sm:mb-20">
                        <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-3 sm:mb-4">How it works</span>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight">From chaos to clarity in four steps</h2>
                    </Reveal>

                    <div className="relative pl-12 sm:pl-14 md:pl-20">
                        <div className="absolute left-4 sm:left-5 md:left-8 top-0 bottom-0 w-px bg-slate-800" />
                        <motion.div
                            style={{ scaleY: lineScale }}
                            className="absolute left-4 sm:left-5 md:left-8 top-0 bottom-0 w-px origin-top bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"
                        />
                        <div className="space-y-10 sm:space-y-16">
                            {steps.map((s, i) => (
                                <Reveal key={s.title} delay={0.05}>
                                    <div className="relative">
                                        <span className="absolute -left-12 sm:-left-14 md:-left-20 top-0 h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-4 ring-slate-950">
                                            <s.icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                        </span>
                                        <p className="text-xs sm:text-sm font-semibold text-indigo-400 mb-1">Step {i + 1}</p>
                                        <h3 className="text-lg sm:text-2xl font-semibold mb-1.5 sm:mb-2">{s.title}</h3>
                                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">{s.desc}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------------- Security ------------------------------ */}
            <section id="security" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-16 items-center">
                    <Reveal>
                        <span className="inline-block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4">Security</span>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4 sm:mb-5">
                            Enterprise-grade security, by default
                        </h2>
                        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
                            Your data and your team's access are protected at every layer, so you can focus on shipping.
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {['Encrypted at rest', 'Role-based access', '2FA', 'Audit logs'].map((b) => (
                                <span key={b} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium border border-emerald-100 dark:border-emerald-800">
                                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> {b}
                                </span>
                            ))}
                        </div>
                    </Reveal>

                    <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        {securityItems.map((s) => (
                            <motion.div
                                key={s.title}
                                variants={item}
                                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                            >
                                <s.icon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4" />
                                <h3 className="font-semibold text-sm sm:text-base mb-1">{s.title}</h3>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* ------------------------------- Testimonials ---------------------------- */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading eyebrow="Loved by teams" title="Teams ship more with TaskForge" />
                    <Stagger className="grid md:grid-cols-3 gap-4 sm:gap-6">
                        {testimonials.map((t) => (
                            <motion.figure
                                key={t.n}
                                variants={item}
                                whileHover={reduce ? {} : { y: -6 }}
                                className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
                            >
                                <div className="flex gap-1 mb-3 sm:mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />)}
                                </div>
                                <blockquote className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed flex-1">"{t.q}"</blockquote>
                                <figcaption className="mt-4 sm:mt-6 flex items-center gap-3">
                                    <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />
                                    <span className="min-w-0">
                                        <span className="block text-xs sm:text-sm font-semibold truncate">{t.n}</span>
                                        <span className="block text-[10px] sm:text-xs text-slate-500 truncate">{t.r}</span>
                                    </span>
                                </figcaption>
                            </motion.figure>
                        ))}
                    </Stagger>
                </div>
            </section>

            {/* --------------------------------- Pricing ------------------------------- */}
            <section id="pricing" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <SectionHeading
                        eyebrow="Pricing"
                        title="Simple pricing that scales with you"
                        subtitle="Start free. Upgrade when your team is ready."
                    />

                    <Reveal className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
                        <span className={`text-xs sm:text-sm font-medium ${!yearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setYearly((v) => !v)}
                            aria-label="Toggle billing period"
                            className={`relative h-6 w-11 sm:h-7 sm:w-12 rounded-full transition-colors ${yearly ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`absolute top-0.5 sm:top-1 h-5 w-5 rounded-full bg-white shadow ${yearly ? 'right-0.5 sm:right-1' : 'left-0.5 sm:left-1'}`} />
                        </button>
                        <span className={`text-xs sm:text-sm font-medium ${yearly ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            Yearly <span className="ml-1 text-[10px] sm:text-xs text-emerald-600 font-semibold">Save 25%</span>
                        </span>
                    </Reveal>

                    <Stagger className="grid md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                        {plans.map((p) => {
                            const price = yearly ? p.y : p.m;
                            return (
                                <motion.div
                                    key={p.name}
                                    variants={item}
                                    whileHover={reduce ? {} : { y: -8 }}
                                    className={`relative p-5 sm:p-8 rounded-2xl sm:rounded-3xl border flex flex-col ${
                                        p.popular
                                            ? 'bg-slate-950 text-white border-indigo-500 shadow-2xl shadow-indigo-500/20 md:scale-105'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    {p.popular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white whitespace-nowrap">
                                            Most popular
                                        </span>
                                    )}
                                    <h3 className="text-base sm:text-lg font-semibold">{p.name}</h3>
                                    <p className={`text-xs sm:text-sm mt-1 ${p.popular ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'}`}>{p.desc}</p>
                                    <div className="my-5 sm:my-6 h-12 sm:h-14 flex items-end">
                                        {price === null ? (
                                            <span className="text-3xl sm:text-4xl font-extrabold">Custom</span>
                                        ) : (
                                            <>
                                                <span className="text-4xl sm:text-5xl font-extrabold">${price}</span>
                                                <span className={`ml-1.5 sm:ml-2 mb-1 text-xs sm:text-sm ${p.popular ? 'text-slate-400' : 'text-slate-500'}`}>/user/mo</span>
                                            </>
                                        )}
                                    </div>
                                    <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                                        {p.feats.map((f) => (
                                            <li key={f} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm">
                                                <Check className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${p.popular ? 'text-indigo-400' : 'text-emerald-500'}`} />
                                                <span className={p.popular ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link to={p.name === 'Enterprise' ? '/contact' : '/register'}>
                                        <Button variant={p.popular ? undefined : 'outline'} className="w-full">{p.cta}</Button>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </Stagger>
                </div>
            </section>

            {/* ----------------------------------- FAQ --------------------------------- */}
            <section id="faq" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-3xl mx-auto">
                    <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
                    <Reveal className="space-y-2.5 sm:space-y-3">
                        {faqs.map((f, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={f.q} className="rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(open ? -1 : i)}
                                        className="w-full flex items-center justify-between gap-3 sm:gap-4 text-left px-4 sm:px-6 py-4 sm:py-5 font-medium text-sm sm:text-base"
                                        aria-expanded={open}
                                    >
                                        <span className="pr-1">{f.q}</span>
                                        <span className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            {open ? <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                        </span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease }}
                                            >
                                                <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </Reveal>
                </div>
            </section>

            {/* --------------------------------- Final CTA ----------------------------- */}
            <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <Reveal>
                    <div className="relative max-w-6xl mx-auto rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-5 sm:px-8 py-12 sm:py-20 text-center text-white">
                        <motion.div
                            animate={reduce ? {} : { scale: [1, 1.25, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -top-24 -left-24 h-64 w-64 sm:h-96 sm:w-96 rounded-full bg-white/30 blur-3xl"
                        />
                        <div className="relative">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-5">
                                Ready to forge your best work?
                            </h2>
                            <p className="text-sm sm:text-lg text-white/80 max-w-xl mx-auto mb-8 sm:mb-10">
                                Join thousands of teams already shipping faster with TaskForge. Try the demo or start free today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                <button
                                    onClick={handleDemoLogin}
                                    disabled={isLoading}
                                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-slate-100 transition-colors disabled:opacity-70 text-sm sm:text-base"
                                >
                                    <Play className="h-4 w-4 sm:h-5 sm:w-5" /> {isLoading ? 'Loading...' : 'Try Live Demo'}
                                </button>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border border-white/40 font-semibold hover:bg-white/10 transition-colors text-sm sm:text-base"
                                >
                                    Start for Free <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ---------------------------------- Footer -------------------------------- */}
            <footer className="border-t border-slate-200 dark:border-slate-800 pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 font-bold text-lg sm:text-xl mb-3 sm:mb-4">
                            <span className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </span>
                            TaskForge
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                            The visual workspace for teams that want to get things done without the chaos.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-5 text-xs sm:text-sm text-slate-500">
                            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> English
                            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-3 sm:ml-4" /> All systems operational
                        </div>
                    </div>
                    {[
                        { h: 'Product', l: ['Features', 'Pricing', 'Security', 'Changelog'] },
                        { h: 'Company', l: ['About', 'Careers', 'Blog', 'Contact'] },
                        { h: 'Legal', l: ['Privacy', 'Terms', 'Cookies', 'DPA'] },
                    ].map((c) => (
                        <div key={c.h}>
                            <h4 className="font-semibold text-xs sm:text-sm mb-3 sm:mb-4">{c.h}</h4>
                            <ul className="space-y-2.5 sm:space-y-3">
                                {c.l.map((x) => (
                                    <li key={x}>
                                        <a href="#" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{x}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto mt-10 sm:mt-14 pt-5 sm:pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-2 text-xs sm:text-sm text-slate-500">
                    <span>© {new Date().getFullYear()} TaskForge. All rights reserved.</span>
                    <span>Built with MERN Stack.</span>
                </div>
            </footer>
        </div>
    );
}