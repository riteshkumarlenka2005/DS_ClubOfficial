-- ============================================
-- SEED: TEAM MEMBERS
-- ============================================

-- LEADERSHIP (department='leadership', tier='lead')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Priyanshu Gupta', '23CSE513', 'Club Lead', 'leadership', 'lead', NULL,
 'Visionary leader driving DSC GIETU''s mission forward. Passionate about building data-driven communities and mentoring the next generation of tech leaders.',
 'student1', 'https://linkedin.com/in/priyanshu-gupta', 'https://github.com/priyanshu-gupta', 'https://instagram.com/priyanshu.gupta', NULL, 1),

('Snehashree Panda', '23CSEDS048', 'Club Deputy Lead', 'leadership', 'lead', NULL,
 'Strategic thinker and operations expert ensuring smooth execution of all club initiatives. Focused on bridging academic research with practical applications.',
 'student2', 'https://linkedin.com/in/snehashree-panda', 'https://github.com/snehashree-panda', 'https://instagram.com/snehashree.panda', NULL, 2);

-- TECHNICAL HEADS (department='technical', tier='head')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Chitranshu Sanket', '23CSEDS037', 'Technical Head', 'technical', 'head', NULL,
 'Leads the technical vision of DSC. Expertise in machine learning architectures and scalable data pipelines.',
 'tech1', 'https://linkedin.com/in/chitranshu-sanket', 'https://github.com/chitranshu-sanket', NULL, NULL, 1),

('Vaishnavi Patnaik', '23CSE280', 'Technical Co-Head', 'technical', 'head', NULL,
 'Deep learning enthusiast specializing in NLP and computer vision. Drives workshop curriculum and hackathon prep.',
 'tech2', 'https://linkedin.com/in/vaishnavi-patnaik', 'https://github.com/vaishnavi-patnaik', NULL, NULL, 2),

('Sushobhan Pal', '24CSEAIMLO22', 'Technical Co-Head', 'technical', 'head', NULL,
 'AI/ML researcher with a passion for ethical AI and open-source contributions. Coordinates technical mentorship programs.',
 'tech3', 'https://linkedin.com/in/sushobhan-pal', 'https://github.com/sushobhan-pal', NULL, NULL, 3);

-- TECHNICAL CORE (department='technical', tier='core')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Khusi Nayak', '23CSE589', 'Core Member - Technical', 'technical', 'core', NULL,
 'Focused on data visualization and analytics. Contributes to building internal tools and club projects.',
 'techcore1', 'https://linkedin.com/in/khusi-nayak', 'https://github.com/khusi-nayak', NULL, NULL, 1),

('Abhinav Kumar', '23CSEDS042', 'Core Member - Technical', 'technical', 'core', NULL,
 'Backend systems and database architecture specialist. Builds robust infrastructure for club platforms.',
 'techcore2', 'https://linkedin.com/in/abhinav-kumar', 'https://github.com/abhinav-kumar', NULL, NULL, 2);

-- TECHNICAL CO-MEMBERS (department='technical', tier='co-member')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Manan Patel', '240CSE015', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Exploring the intersection of data science and web technologies. Active contributor to club workshops.',
 'techco1', NULL, 'https://github.com/manan-patel', NULL, NULL, 1),

('Puppala Harish', '24CSEAIML169', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Passionate about deep learning and neural network optimization. Participates in national-level hackathons.',
 'techco2', NULL, 'https://github.com/puppala-harish', NULL, NULL, 2),

('Milind Panda', '24CSE097', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Full-stack developer with growing expertise in data engineering and ETL pipelines.',
 'techco3', NULL, 'https://github.com/milind-panda', NULL, NULL, 3),

('Saripilli Maruthi', '24CSEDSO17', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Interested in statistical modeling and predictive analytics. Actively learning advanced ML techniques.',
 'techco4', NULL, 'https://github.com/saripilli-maruthi', NULL, NULL, 4),

('Aman Kumar Singh', '24CSEAIMLO79', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'AI enthusiast working on computer vision projects. Keen on applying ML to real-world problems.',
 'techco5', NULL, 'https://github.com/aman-kumar-singh', NULL, NULL, 5),

('Ritesh Kumar Lenka', '24CSE143', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Web developer and aspiring data scientist. Passionate about building impactful tech solutions and open-source projects.',
 'techco6', 'https://linkedin.com/in/ritesh-lenka', 'https://github.com/ritesh-lenka', 'https://instagram.com/ritesh.lenka', NULL, 6),

('Subhasis Samantaray', '240CSEDS038', 'Co-Member - Technical', 'technical', 'co-member', NULL,
 'Exploring data science fundamentals with a focus on Python-based analytics and visualization.',
 'techco7', NULL, 'https://github.com/subhasis-samantaray', NULL, NULL, 7);

-- MANAGEMENT HEADS (department='management', tier='head')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Ayush Choudhury', '23CSEDS029', 'Management & Operations Head', 'management', 'head', NULL,
 'Orchestrates all club operations, from event logistics to partnerships. Ensures seamless execution of every initiative.',
 'mgmt1', 'https://linkedin.com/in/ayush-choudhury', NULL, 'https://instagram.com/ayush.choudhury', NULL, 1),

('Devidutta Parida', '23CSE231', 'Management & Operations Co-Head', 'management', 'head', NULL,
 'Operations strategist handling resource allocation, vendor coordination, and cross-team communication.',
 'mgmt2', 'https://linkedin.com/in/devidutta-parida', NULL, NULL, NULL, 2),

('Soumya Ranjan Padhi', '24CSEAIMLO65', 'Event Coordinator', 'management', 'head', NULL,
 'Master planner behind DSC''s flagship events. Coordinates logistics, speakers, and participant experiences.',
 'mgmt3', 'https://linkedin.com/in/soumya-padhi', NULL, 'https://instagram.com/soumya.padhi', NULL, 3);

-- MANAGEMENT CORE (department='management', tier='core')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Jaya Prakash Sahoo', '23CSE586', 'Core Member - Mgmt', 'management', 'core', NULL,
 'Handles sponsorship outreach and external relations. Key contributor to club growth initiatives.',
 'mgmtcore1', 'https://linkedin.com/in/jaya-sahoo', NULL, NULL, NULL, 1),

('Raj Kumar Sahu', '23CSE496', 'Core Member - Mgmt', 'management', 'core', NULL,
 'Drives member engagement and retention strategies. Focuses on building an inclusive club culture.',
 'mgmtcore2', 'https://linkedin.com/in/raj-sahu', NULL, NULL, NULL, 2);

-- MANAGEMENT CO-MEMBERS (department='management', tier='co-member')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Ashish Palo', '24CSEAIML071', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Assists in event planning and on-ground coordination. Developing leadership and project management skills.',
 'mgmtco1', NULL, NULL, NULL, NULL, 1),

('Srusti Panigrahi', '24CSEAIML333', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Supports outreach campaigns and member onboarding. Active in community building efforts.',
 'mgmtco2', NULL, NULL, 'https://instagram.com/srusti.panigrahi', NULL, 2),

('Rudrakshya Kumar', '24CSEAIML281', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Contributes to logistics planning and documentation. Focused on operational efficiency improvements.',
 'mgmtco3', NULL, NULL, NULL, NULL, 3),

('Gopal Krushna Parnda', '24CSEDS020', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Works on inter-club collaborations and campus partnerships. Passionate about building tech communities.',
 'mgmtco4', NULL, NULL, NULL, NULL, 4),

('Abhinash Kumar Singh', '24CSEAIMLO88', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Handles internal communications and meeting coordination. Streamlines team workflows.',
 'mgmtco5', NULL, NULL, NULL, NULL, 5),

('Rada Suvarthika', '24CSEDS011', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Active contributor to event management and participant engagement strategies.',
 'mgmtco6', NULL, NULL, NULL, NULL, 6),

('Ravulla Adhiraj', '24CSEAIML225', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Supports financial planning and budget management for club events and activities.',
 'mgmtco7', NULL, NULL, NULL, NULL, 7),

('Subrat Jena', '24CSEAIML101', 'Co-Member - Mgmt', 'management', 'co-member', NULL,
 'Assists in scheduling, resource allocation, and day-to-day operational tasks.',
 'mgmtco8', NULL, NULL, NULL, NULL, 8);

-- CREATIVE: SOCIAL (department='creative', tier='head', sub_category='social')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Priyanshu Gupta', '23CSE513', 'Social Media Manager', 'creative', 'head', 'social',
 'Crafts the digital identity of DSC GIETU across all social platforms. Drives engagement through compelling content strategies.',
 'social1', 'https://linkedin.com/in/priyanshu-gupta', NULL, 'https://instagram.com/priyanshu.gupta', NULL, 1);

-- CREATIVE: DESIGN (department='creative', tier='core', sub_category='design')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Swati Rekha Jena', '23CSEAIMLO27', 'Designer', 'creative', 'core', 'design',
 'Creates stunning visual designs for events, social media, and club branding. Master of modern design aesthetics.',
 'des1', NULL, NULL, 'https://instagram.com/swati.jena', NULL, 1),

('P. Pradeep Kumar', '23CSE250', 'Designer', 'creative', 'core', 'design',
 'UI/UX designer with an eye for detail. Designs intuitive interfaces and captivating promotional materials.',
 'des2', NULL, NULL, 'https://instagram.com/pradeep.kumar', NULL, 2),

('Meegada Deepika', '24CSE275', 'Designer', 'creative', 'core', 'design',
 'Graphic design enthusiast specializing in poster design, infographics, and brand identity systems.',
 'des3', NULL, NULL, 'https://instagram.com/meegada.deepika', NULL, 3),

('Srimaya Kumar Pradhan', '24CSEAIML161', 'Designer', 'creative', 'core', 'design',
 'Creative designer exploring the fusion of art and technology. Contributes to all visual content for events.',
 'des4', NULL, NULL, 'https://instagram.com/srimaya.pradhan', NULL, 4);

-- CREATIVE: VIDEO (department='creative', tier='core', sub_category='video')
INSERT INTO public.team_members (name, student_id, role, department, tier, sub_category, bio, img_seed, linkedin_url, github_url, instagram_url, email, display_order) VALUES
('Lipsa Samantray', '23CSEDS049', 'Video Editor & Content', 'creative', 'core', 'video',
 'Produces high-quality video content including event recaps, tutorials, and promotional videos for DSC.',
 'vid1', NULL, NULL, 'https://instagram.com/lipsa.samantray', NULL, 1),

('Tanmay Bhuyan', '24CSE215', 'Video Editor & Content', 'creative', 'core', 'video',
 'Cinematographer and editor bringing DSC stories to life through dynamic video production.',
 'vid2', NULL, NULL, 'https://instagram.com/tanmay.bhuyan', NULL, 2);