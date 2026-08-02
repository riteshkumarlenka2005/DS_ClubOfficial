import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Terminal, Table, Binary, Database, BrainCircuit,
    BarChart3, PieChart, Zap, Flame, Package, Languages, MessageSquareCode,
    ExternalLink, BookOpen, Wrench, Map
} from 'lucide-react';

interface TechData {
    name: string;
    tagline: string;
    icon: React.ElementType;
    color: string;
    overview: string;
    roadmap: string[];
    tools: string[];
    links: { label: string; url: string }[];
}

const TECH_DATA: Record<string, TechData> = {
    python: {
        name: 'Python',
        tagline: 'The lingua franca of data science',
        icon: Terminal,
        color: '#3776AB',
        overview: 'Python is the dominant programming language in data science, machine learning, and AI. Its rich ecosystem of libraries like NumPy, Pandas, and Scikit-learn make it the go-to choice for data professionals worldwide.',
        roadmap: [
            'Learn Python fundamentals — variables, loops, functions, OOP',
            'Master data structures — lists, dicts, sets, tuples',
            'Explore scientific computing with NumPy and SciPy',
            'Data manipulation with Pandas and data visualization with Matplotlib',
            'Build ML models with Scikit-learn',
            'Deep learning with TensorFlow or PyTorch'
        ],
        tools: ['Jupyter', 'VS Code', 'Anaconda', 'pip', 'virtualenv', 'Poetry'],
        links: [
            { label: 'Official Docs', url: 'https://docs.python.org/3/' },
            { label: 'Real Python Tutorials', url: 'https://realpython.com/' },
            { label: 'Python Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/' }
        ]
    },
    pandas: {
        name: 'Pandas',
        tagline: 'Data manipulation and analysis made simple',
        icon: Table,
        color: '#150458',
        overview: 'Pandas provides fast, flexible, and expressive data structures designed to make working with structured and time series data both easy and intuitive. It is the backbone of data wrangling in Python.',
        roadmap: [
            'Understand Series and DataFrame objects',
            'Learn indexing, slicing, and filtering',
            'Master groupby, merge, join, and pivot operations',
            'Handle missing data and data cleaning',
            'Time series analysis and resampling',
            'Performance optimization with vectorized operations'
        ],
        tools: ['Jupyter Notebook', 'pandas-profiling', 'Modin', 'Dask'],
        links: [
            { label: 'Official Docs', url: 'https://pandas.pydata.org/docs/' },
            { label: '10 Minutes to Pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' },
            { label: 'Kaggle Pandas Course', url: 'https://www.kaggle.com/learn/pandas' }
        ]
    },
    numpy: {
        name: 'NumPy',
        tagline: 'Foundation of numerical computing in Python',
        icon: Binary,
        color: '#4D77CF',
        overview: 'NumPy is the fundamental package for scientific computing in Python. It provides support for large, multi-dimensional arrays and matrices, along with a vast collection of mathematical functions to operate on them.',
        roadmap: [
            'Understand ndarray creation and manipulation',
            'Learn broadcasting and vectorized operations',
            'Master linear algebra operations',
            'Random number generation and statistical functions',
            'Memory layout and performance optimization',
            'Integration with other scientific Python libraries'
        ],
        tools: ['Jupyter', 'SciPy', 'Matplotlib', 'BLAS/LAPACK'],
        links: [
            { label: 'Official Docs', url: 'https://numpy.org/doc/' },
            { label: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html' },
            { label: 'From Python to NumPy', url: 'https://www.labri.fr/perso/nrougier/from-python-to-numpy/' }
        ]
    },
    sql: {
        name: 'SQL',
        tagline: 'The language of relational databases',
        icon: Database,
        color: '#4479A1',
        overview: 'SQL (Structured Query Language) is essential for querying, manipulating, and managing relational databases. Every data scientist needs strong SQL skills to extract insights from large datasets stored in databases.',
        roadmap: [
            'Learn SELECT, WHERE, and basic filtering',
            'Joins — INNER, LEFT, RIGHT, FULL OUTER',
            'Aggregation — GROUP BY, HAVING, window functions',
            'Subqueries and CTEs',
            'Database design and normalization',
            'Performance tuning and indexing strategies'
        ],
        tools: ['PostgreSQL', 'MySQL', 'SQLite', 'DBeaver', 'pgAdmin'],
        links: [
            { label: 'SQLZoo Interactive', url: 'https://sqlzoo.net/' },
            { label: 'Mode Analytics SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
            { label: 'W3Schools SQL', url: 'https://www.w3schools.com/sql/' }
        ]
    },
    ml: {
        name: 'Machine Learning',
        tagline: 'Teaching machines to learn from data',
        icon: BrainCircuit,
        color: '#9667E0',
        overview: 'Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It powers recommendations, fraud detection, autonomous systems, and more.',
        roadmap: [
            'Understand supervised vs unsupervised learning',
            'Linear regression, logistic regression, decision trees',
            'Ensemble methods — Random Forest, XGBoost, LightGBM',
            'Model evaluation — cross-validation, metrics, bias-variance',
            'Feature engineering and selection',
            'Hyperparameter tuning and model deployment'
        ],
        tools: ['Scikit-learn', 'XGBoost', 'LightGBM', 'MLflow', 'Weights & Biases'],
        links: [
            { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
            { label: 'fast.ai Courses', url: 'https://www.fast.ai/' },
            { label: 'Stanford CS229', url: 'https://cs229.stanford.edu/' }
        ]
    },
    'power-bi': {
        name: 'Power BI',
        tagline: 'Business intelligence at enterprise scale',
        icon: BarChart3,
        color: '#F2C811',
        overview: 'Power BI is Microsoft\'s interactive data visualization and business intelligence tool. It enables professionals to create dashboards, reports, and data models that drive business decisions.',
        roadmap: [
            'Navigate Power BI Desktop interface',
            'Connect and transform data with Power Query',
            'Build data models and relationships',
            'DAX formulas and calculated measures',
            'Design interactive dashboards and reports',
            'Publish and share via Power BI Service'
        ],
        tools: ['Power BI Desktop', 'Power Query', 'DAX Studio', 'Tabular Editor'],
        links: [
            { label: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/power-bi/' },
            { label: 'SQLBI DAX Guides', url: 'https://www.sqlbi.com/guides/dax/' },
            { label: 'Guy in a Cube YouTube', url: 'https://www.youtube.com/@GuyInACube' }
        ]
    },
    tableau: {
        name: 'Tableau',
        tagline: 'Visual analytics that changes how you see data',
        icon: PieChart,
        color: '#E97627',
        overview: 'Tableau is the leading visual analytics platform that helps people see and understand data. Its drag-and-drop interface makes it easy to create complex visualizations and gain rapid insights.',
        roadmap: [
            'Understand Tableau workspace and shelves',
            'Connect to data sources and manage extracts',
            'Build charts — bar, line, scatter, map, treemap',
            'Calculated fields and table calculations',
            'Dashboard design and interactivity',
            'Tableau Server publishing and collaboration'
        ],
        tools: ['Tableau Desktop', 'Tableau Public', 'Tableau Prep', 'Tableau Server'],
        links: [
            { label: 'Tableau Public Gallery', url: 'https://public.tableau.com/gallery/' },
            { label: 'Tableau Training', url: 'https://www.tableau.com/learn/training' },
            { label: 'Makeover Monday', url: 'https://www.makeovermonday.co.uk/' }
        ]
    },
    tensorflow: {
        name: 'TensorFlow',
        tagline: 'End-to-end open source ML platform',
        icon: Zap,
        color: '#FF6F00',
        overview: 'TensorFlow is Google\'s open-source machine learning framework for building and deploying ML models. It supports everything from research prototyping to production deployment across servers, edge devices, and browsers.',
        roadmap: [
            'Understand tensors and computation graphs',
            'Build neural networks with Keras API',
            'CNNs for computer vision tasks',
            'RNNs and Transformers for NLP',
            'TensorFlow Serving and TFLite for deployment',
            'Custom training loops and advanced architectures'
        ],
        tools: ['TensorBoard', 'TF Serving', 'TFLite', 'TF.js', 'Keras'],
        links: [
            { label: 'Official Tutorials', url: 'https://www.tensorflow.org/tutorials' },
            { label: 'TensorFlow Playground', url: 'https://playground.tensorflow.org/' },
            { label: 'Keras Documentation', url: 'https://keras.io/' }
        ]
    },
    pytorch: {
        name: 'PyTorch',
        tagline: 'From research to production with dynamic computation',
        icon: Flame,
        color: '#EE4C2C',
        overview: 'PyTorch is a deep learning framework favored by researchers for its dynamic computation graph, intuitive Pythonic API, and strong GPU acceleration. It has become the standard in academic ML research.',
        roadmap: [
            'Understand autograd and dynamic computation graphs',
            'Build neural networks with nn.Module',
            'DataLoaders and custom datasets',
            'CNNs, RNNs, and Transformer architectures',
            'Distributed training and mixed precision',
            'TorchScript and ONNX export for production'
        ],
        tools: ['PyTorch Lightning', 'Hugging Face', 'torchvision', 'torchaudio'],
        links: [
            { label: 'Official Tutorials', url: 'https://pytorch.org/tutorials/' },
            { label: 'Deep Learning with PyTorch', url: 'https://pytorch.org/deep-learning-with-pytorch' },
            { label: 'Papers With Code', url: 'https://paperswithcode.com/' }
        ]
    },
    docker: {
        name: 'Docker',
        tagline: 'Containerize, ship, and run anywhere',
        icon: Package,
        color: '#2496ED',
        overview: 'Docker enables data scientists and ML engineers to package applications with all dependencies into standardized containers. This ensures reproducibility across development, testing, and production environments.',
        roadmap: [
            'Understand containers vs virtual machines',
            'Dockerfile creation and image building',
            'Docker Compose for multi-service apps',
            'Volume mounting and networking',
            'Container registries and CI/CD integration',
            'Kubernetes basics for orchestration'
        ],
        tools: ['Docker Desktop', 'Docker Compose', 'Docker Hub', 'Kubernetes', 'Podman'],
        links: [
            { label: 'Docker Docs', url: 'https://docs.docker.com/get-started/' },
            { label: 'Docker for Data Science', url: 'https://towardsdatascience.com/docker-for-data-science-4901f35d7cf9' },
            { label: 'Play with Docker', url: 'https://labs.play-with-docker.com/' }
        ]
    },
    nlp: {
        name: 'NLP',
        tagline: 'Making machines understand human language',
        icon: Languages,
        color: '#4B2C82',
        overview: 'Natural Language Processing bridges the gap between human communication and machine understanding. From sentiment analysis to machine translation, NLP powers the conversational AI revolution.',
        roadmap: [
            'Text preprocessing — tokenization, stemming, lemmatization',
            'Bag of Words, TF-IDF, and word embeddings',
            'Sequence models — RNN, LSTM, GRU',
            'Attention mechanism and Transformers',
            'Pre-trained models — BERT, GPT, T5',
            'Fine-tuning and prompt engineering'
        ],
        tools: ['spaCy', 'NLTK', 'Hugging Face Transformers', 'Gensim', 'LangChain'],
        links: [
            { label: 'Hugging Face Course', url: 'https://huggingface.co/learn/nlp-course' },
            { label: 'Stanford CS224N', url: 'https://web.stanford.edu/class/cs224n/' },
            { label: 'spaCy 101', url: 'https://spacy.io/usage/spacy-101' }
        ]
    },
    chatgpt: {
        name: 'ChatGPT',
        tagline: 'Conversational AI and prompt engineering',
        icon: MessageSquareCode,
        color: '#10a37f',
        overview: 'ChatGPT and large language models represent the frontier of conversational AI. Understanding how to leverage these models through prompt engineering, fine-tuning, and API integration is essential for modern data scientists.',
        roadmap: [
            'Understand large language model fundamentals',
            'Master prompt engineering techniques',
            'OpenAI API integration and function calling',
            'RAG — Retrieval Augmented Generation',
            'Fine-tuning and model customization',
            'Building AI agents and agentic workflows'
        ],
        tools: ['OpenAI API', 'LangChain', 'LlamaIndex', 'Ollama', 'Anthropic Claude'],
        links: [
            { label: 'OpenAI Documentation', url: 'https://platform.openai.com/docs' },
            { label: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai/' },
            { label: 'LangChain Docs', url: 'https://docs.langchain.com/' }
        ]
    }
};

const TechResource = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const tech = slug ? TECH_DATA[slug] : null;

    if (!tech) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1A0B2E] mb-4">Technology Not Found</h1>
                <p className="text-[#2D164B] mb-8">The resource you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-[#1A0B2E] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#4B2C82] transition-all"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const IconComponent = tech.icon;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-[#FAF9FE] to-[#EEEAFD]">
            {/* Back button */}
            <div className="container mx-auto px-6 pt-4 pb-2">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/#ecosystem')}
                    className="flex items-center gap-2 text-[#9667E0] font-bold text-sm uppercase tracking-widest hover:text-[#1A0B2E] transition-colors group cursor-pointer"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Ecosystem
                </motion.button>
            </div>

            {/* Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-6 py-10 md:py-16"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <div
                        className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center shadow-xl"
                        style={{ background: tech.color }}
                    >
                        <IconComponent className="w-10 h-10 md:w-14 md:h-14 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#1A0B2E] tracking-tight">{tech.name}</h1>
                        <p className="text-base md:text-xl font-semibold text-[#4B2C82] mt-2">{tech.tagline}</p>
                    </div>
                </div>
            </motion.div>

            {/* Content Grid */}
            <div className="container mx-auto px-6 pb-12 md:pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Overview Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 border border-[#E0D4F5] shadow-sm col-span-1 lg:col-span-2"
                    >
                        <div className="flex items-center gap-3 mb-5">
                            <BookOpen size={20} className="text-[#9667E0]" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9667E0]">Overview</h2>
                        </div>
                        <p className="text-[#2D164B] text-base md:text-lg leading-relaxed font-medium">{tech.overview}</p>
                    </motion.div>

                    {/* Learning Roadmap */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 border border-[#E0D4F5] shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Map size={20} className="text-[#9667E0]" />
                            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9667E0]">Learning Roadmap</h2>
                        </div>
                        <ol className="space-y-4">
                            {tech.roadmap.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-4">
                                    <span
                                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: '#1A0B2E' }}
                                    >
                                        {idx + 1}
                                    </span>
                                    <span className="text-[#2D164B] font-medium text-sm md:text-base leading-relaxed pt-0.5">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </motion.div>

                    {/* Right column */}
                    <div className="flex flex-col gap-8">
                        {/* Tools & Libraries */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 border border-[#E0D4F5] shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <Wrench size={20} className="text-[#9667E0]" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9667E0]">Key Tools & Libraries</h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {tech.tools.map(tool => (
                                    <span
                                        key={tool}
                                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-[#D8CAF6] text-[#1A0B2E] bg-[#EEEAFD]/50"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Resources & Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl p-5 sm:p-8 md:p-10 border border-[#E0D4F5] shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <ExternalLink size={20} className="text-[#9667E0]" />
                                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9667E0]">Resources & Links</h2>
                            </div>
                            <div className="space-y-3">
                                {tech.links.map(link => (
                                    <a
                                        key={link.label}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-xl border border-[#E0D4F5] hover:border-[#9667E0] hover:bg-[#EEEAFD]/30 transition-all group"
                                    >
                                        <span className="font-semibold text-sm text-[#1A0B2E] group-hover:text-[#9667E0] transition-colors">{link.label}</span>
                                        <ExternalLink size={16} className="text-[#9667E0] opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechResource;
