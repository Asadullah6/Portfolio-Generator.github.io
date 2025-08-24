  let currentTheme = 'modern';
        let portfolioData = null;

        // Theme Selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                currentTheme = option.dataset.theme;
            });
        });

        // Theme Selector Change
        document.getElementById('themeSelector').addEventListener('change', (e) => {
            currentTheme = e.target.value;
            if (portfolioData) {
                generatePortfolioHTML(portfolioData);
            }
        });

        // Form Submit
        document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            if (username) {
                await fetchGitHubData(username);
            }
        });

        // Demo Button
        document.getElementById('demoBtn').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('username').value = 'octocat';
            fetchGitHubData('octocat');
        });

        // Fetch GitHub Data
        async function fetchGitHubData(username) {
            const loading = document.getElementById('loading');
            const generateBtn = document.getElementById('generateBtn');
            
            loading.style.display = 'block';
            generateBtn.disabled = true;

            try {
                // Fetch user data
                const userResponse = await fetch(`https://api.github.com/users/${username}`);
                const userData = await userResponse.json();

                if (userData.message === 'Not Found') {
                    throw new Error('User not found');
                }

                // Fetch repositories
                const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=20`);
                const repos = await reposResponse.json();

                portfolioData = {
                    user: userData,
                    repos: repos.filter(repo => !repo.fork).slice(0, 6),
                    skills: extractSkills(repos),
                    stats: {
                        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
                        totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0)
                    }
                };

                generatePortfolioHTML(portfolioData);
                
            } catch (error) {
                alert('Error fetching GitHub data: ' + error.message);
            } finally {
                loading.style.display = 'none';
                generateBtn.disabled = false;
            }
        }

        // Extract Skills from Repositories
        function extractSkills(repos) {
            const langCount = {};
            repos.forEach(repo => {
                if (repo.language) {
                    langCount[repo.language] = (langCount[repo.language] || 0) + 1;
                }
            });
            
            return Object.entries(langCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([lang]) => lang);
        }

        // Generate Portfolio HTML
        function generatePortfolioHTML(data) {
            const { user, repos, skills, stats } = data;
            
            // Update theme selector
            document.getElementById('themeSelector').value = currentTheme;
            
            // Update portfolio owner
            document.getElementById('portfolioOwner').textContent = `${user.name || user.login}'s Portfolio`;
            
            // Generate portfolio content
            const portfolioContent = `
                <!-- Header -->
                <div class="portfolio-header">
                    <div class="container">
                        <img src="${user.avatar_url}" alt="${user.name || user.login}" class="profile-image">
                        <h1 class="portfolio-title">${user.name || user.login}</h1>
                        <p class="portfolio-subtitle">Full Stack Developer</p>
                        <p class="portfolio-bio">
                            ${user.bio || `Passionate developer with ${user.public_repos}+ repositories on GitHub. Building innovative solutions and contributing to open source projects.`}
                        </p>
                        <div class="social-links">
                            <a href="${user.html_url}" class="social-link" target="_blank">
                                <i class="fab fa-github"></i> GitHub
                            </a>
                            ${user.email ? `<a href="mailto:${user.email}" class="social-link">
                                <i class="fas fa-envelope"></i> Email
                            </a>` : ''}
                            ${user.blog ? `<a href="${user.blog}" class="social-link" target="_blank">
                                <i class="fas fa-globe"></i> Website
                            </a>` : ''}
                            ${user.twitter_username ? `<a href="https://twitter.com/${user.twitter_username}" class="social-link" target="_blank">
                                <i class="fab fa-twitter"></i> Twitter
                            </a>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div class="portfolio-content">
                    <div class="container">
                        <!-- Skills -->
                        <div class="section">
                            <h2 class="section-title">
                                <i class="fas fa-code"></i>
                                Technical Skills
                            </h2>
                            <div class="skills-grid">
                                ${skills.map(skill => `
                                    <span class="skill-tag">${skill}</span>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Projects -->
                        <div class="section">
                            <h2 class="section-title">
                                <i class="fas fa-project-diagram"></i>
                                Featured Projects
                            </h2>
                            <div class="projects-grid">
                                ${repos.map(repo => `
                                    <div class="project-card">
                                        <h3 class="project-title">${repo.name}</h3>
                                        <p class="project-description">${repo.description || 'No description available'}</p>
                                        ${repo.language ? `<span class="project-language">${repo.language}</span>` : ''}
                                        <div class="project-stats">
                                            <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                                            <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                                        </div>
                                        <a href="${repo.html_url}" class="project-link" target="_blank">
                                            View Project <i class="fas fa-external-link-alt"></i>
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Experience -->
                        <div class="section">
                            <h2 class="section-title">
                                <i class="fas fa-briefcase"></i>
                                Experience
                            </h2>
                            <div class="timeline-item">
                                <h3 class="timeline-title">Full Stack Developer</h3>
                                <p class="timeline-company">Open Source Contributor</p>
                                <p class="timeline-period">2020 - Present</p>
                                <p class="timeline-description">
                                    Developed ${repos.length}+ projects with ${stats.totalStars} total stars. 
                                    Experienced in multiple programming languages and frameworks, with a focus on 
                                    creating scalable and efficient solutions.
                                </p>
                            </div>
                        </div>

                        <!-- Education -->
                        <div class="section">
                            <h2 class="section-title">
                                <i class="fas fa-graduation-cap"></i>
                                Education
                            </h2>
                            <div class="timeline-item">
                                <h3 class="timeline-title">Bachelor of Computer Science</h3>
                                <p class="timeline-company">University</p>
                                <p class="timeline-period">2018 - 2022</p>
                                <p class="timeline-description">
                                    Focused on software engineering, algorithms, and web development. 
                                    Graduated with honors and developed strong foundation in computer science principles.
                                </p>
                            </div>
                        </div>

                        <!-- GitHub Stats -->
                        <div class="section">
                            <h2 class="section-title">
                                <i class="fab fa-github"></i>
                                GitHub Statistics
                            </h2>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <span class="stat-number">${user.public_repos}</span>
                                    <div class="stat-label">Public Repositories</div>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number">${user.followers}</span>
                                    <div class="stat-label">Followers</div>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number">${user.following}</span>
                                    <div class="stat-label">Following</div>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number">${stats.totalStars}</span>
                                    <div class="stat-label">Total Stars</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Update content and apply theme
            document.getElementById('portfolioContent').innerHTML = portfolioContent;
            document.getElementById('portfolioContent').className = `portfolio-${currentTheme}`;
            
            // Show portfolio section
            document.getElementById('generatorSection').style.display = 'none';
            document.getElementById('portfolioSection').style.display = 'block';
            
            // Scroll to top
            window.scrollTo(0, 0);
        }

        // Go back to generator
        function goBackToGenerator() {
            document.getElementById('generatorSection').style.display = 'flex';
            document.getElementById('portfolioSection').style.display = 'none';
            document.getElementById('username').value = '';
            portfolioData = null;
        }

        // Print styles
        const printStyles = `
            @media print {
                .portfolio-controls { display: none !important; }
                .portfolio-section { display: block !important; }
                * { print-color-adjust: exact !important; }
                body { margin: 0 !important; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = printStyles;
        document.head.appendChild(styleSheet);
    
