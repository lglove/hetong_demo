import { useEffect, useMemo } from "react";
import "./About.css";

export default function About() {
  useEffect(() => {
    document.title = "李戈｜个人主页";
  }, []);

  const data = useMemo(
    () => ({
      name: "李戈",
      title: "技术经理 / Python 后端",
      meta: "10年工作经验｜期望城市：西安｜期望薪资：20-30K",
      description: "专注于构建稳定、高效的后端系统\n用代码创造价值，用架构驱动业务",
      stats: [
        { label: "年工作经验", value: "10+", icon: "💼" },
        { label: "技术项目", value: "50+", icon: "🚀" },
        { label: "团队管理", value: "5+", icon: "👥" },
        { label: "系统架构", value: "20+", icon: "🏗️" },
      ],
      about: {
        title: "关于我",
        subtitle: "技术架构的实践者",
        description: "大家好！我是李戈，一位热爱技术、专注架构的后端工程师。在技术领域深耕10年，我始终相信代码的力量可以改变世界。",
        content: "我的技术理念很简单：稳定第一！通过微服务架构、容器化部署和可观测性建设，我帮助团队构建了多个高可用、高性能的系统。\n\n作为技术管理的实践者，我主导了多个大型项目的架构设计，推动了团队的容器化改造，建立了完善的开发流程体系。我的使命是：用技术驱动业务，用架构保障稳定！",
        concepts: [
          { icon: "🎯", text: "技术理念", desc: "稳定第一，架构驱动，持续优化" },
          { icon: "💡", text: "核心能力", desc: "微服务架构、系统设计、团队管理" },
          { icon: "🔧", text: "工程实践", desc: "CI/CD、监控体系、规范流程" },
        ],
      },
      contact: {
        phone: "18710846413",
        email: "1065463775@qq.com",
      },
      highlights: [
        "管理后端研发团队，统筹任务分配，选择系统架构，制定开发规范流程。",
        "10年工作经验：5年 Python、4年 Rails、2年 Golang；参与并负责过完整后端架构设计与落地。",
        "能独立带团队完成产品研发任务，关注稳定性、容灾与可观测性。",
      ],
      projects: [
        {
          name: "业务微服务化与容器化改造",
          desc: "主导将单体服务拆分为微服务架构（网关、C端、B端等），提升稳定性与容灾能力。",
          tags: ["架构设计", "容器化", "微服务"],
        },
        {
          name: "日志与监控体系建设",
          desc: "设计并实施日志与监控系统，实现高效监控与快速定位问题，提升优化效率。",
          tags: ["可观测性", "日志", "监控"],
        },
        {
          name: "即时通讯(IM)能力搭建",
          desc: "基于第三方平台搭建 IM 能力，提升 C 端用户与 B 端 HR 沟通效率。",
          tags: ["IM", "系统集成", "业务效率"],
        },
      ],
      skills: [
        { group: "后端", items: ["Python", "REST API", "系统设计", "数据建模"] },
        { group: "架构", items: ["微服务拆分", "容灾与稳定性", "可观测性建设", "规范与流程"] },
        { group: "语言栈", items: ["Python(5年)", "Rails(4年)", "Golang(2年)"] },
        { group: "团队协作", items: ["任务拆解", "排期与发版节奏", "需求评审流程", "代码规范"] },
      ],
      experience: [
        {
          time: "2019.12 - 2025.12",
          company: "北京超职咨询有限公司（技术经理）",
          bullets: [
            "负责后端技术架构设计及业务开发。",
            "推动服务容器化与架构演进，提升稳定性与容灾能力。",
            "搭建日志与监控体系，提升故障定位效率。",
          ],
        },
        {
          time: "2016.12 - 2019.11",
          company: "北京沃丰时代数据科技有限公司（后端开发）",
          bullets: [
            "负责呼叫中心业务开发与日常稳定运行保障。",
            "主导短信群发项目设计与开发，支撑高并发发送场景。",
            "开发并优化公司内部运营系统，提升协作效率与流程自动化。",
          ],
        },
        {
          time: "2015.07 - 2016.12",
          company: "北京五辰鑫达科技有限公司（研发）",
          bullets: ["参与后台管理系统开发，推进业务信息化建设。", "参与 Web 与 App 端模块开发与维护。"],
        },
      ],
      education: [
        {
          time: "2010 - 2014",
          school: "西安电子科技大学",
          degree: "本科｜通信工程",
        },
      ],
      certificates: ["大学英语四级"],
      resumePdfUrl: "/resume/resume.pdf",
    }),
    []
  );

  return (
    <div className="aboutPage">
      <header className="aboutHeader">
        <div className="aboutContainer aboutHeaderInner">
          <a className="aboutBrand" href="#top">
            {data.name}
          </a>
          <nav className="aboutNav">
            <a href="#top">首页</a>
            <a href="#projects">项目</a>
            <a href="#skills">专业能力</a>
            <a href="#experience">工作经历</a>
            <a href="#education">教育经历</a>
            <a href="#contact">联系</a>
          </nav>
        </div>
      </header>

      <main id="top" className="aboutMain">
        <section className="aboutHero">
          <div className="aboutContainer">
            <div className="aboutHeroContent">
              <div className="aboutHeroEmoji">💻 🚀 ⚡</div>
              <div className="aboutKicker">{data.title}</div>
              <h1 className="aboutTitle">{data.name}</h1>
              <p className="aboutSubTitle">{data.description}</p>
              <div className="aboutActions">
                <a className="aboutBtnPrimary" href="#contact">
                  联系我
                </a>
                <a className="aboutBtnGhost" href="#projects">
                  查看作品
                </a>
              </div>
            </div>
            <div className="aboutStats">
              {data.stats.map((stat) => (
                <div className="aboutStatCard" key={stat.label}>
                  <div className="aboutStatIcon">{stat.icon}</div>
                  <div className="aboutStatValue">{stat.value}</div>
                  <div className="aboutStatLabel">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="aboutSection aboutIntro">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">{data.about.title}</h2>
            <div className="aboutIntroContent">
              <div className="aboutIntroMain">
                <div className="aboutIntroSubtitle">{data.about.subtitle}</div>
                <p className="aboutIntroDesc">{data.about.description}</p>
                <p className="aboutIntroContentText">{data.about.content}</p>
              </div>
              <div className="aboutIntroConcepts">
                {data.about.concepts.map((c) => (
                  <div className="aboutConceptCard" key={c.text}>
                    <div className="aboutConceptIcon">{c.icon}</div>
                    <div className="aboutConceptTitle">{c.text}</div>
                    <div className="aboutConceptDesc">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="aboutSection">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">作品集</h2>
            <div className="aboutProjectsGrid">
              {data.projects.map((p) => (
                <div className="aboutProjectCard" key={p.name}>
                  <h3 className="aboutProjectTitle">{p.name}</h3>
                  <p className="aboutProjectDesc">{p.desc}</p>
                  <div className="aboutProjectTags">
                    {p.tags.map((tag) => (
                      <span className="aboutProjectTag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="aboutSection">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">专业能力</h2>
            <div className="aboutSkillsGrid">
              {data.skills.map((g) => (
                <div className="aboutSkillCard" key={g.group}>
                  <h3 className="aboutSkillTitle">{g.group}</h3>
                  <div className="aboutSkillItems">
                    {g.items.map((it) => (
                      <span className="aboutSkillItem" key={it}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="aboutSection">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">工作经验</h2>
            <div className="aboutExperienceList">
              {data.experience.map((e) => (
                <div className="aboutExperienceItem" key={e.company}>
                  <div className="aboutExperienceHeader">
                    <div className="aboutExperienceTime">{e.time}</div>
                    <h3 className="aboutExperienceTitle">{e.company}</h3>
                  </div>
                  <ul className="aboutExperienceBullets">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className="aboutSection">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">教育背景</h2>
            <div className="aboutEducationList">
              {data.education.map((ed) => (
                <div className="aboutEducationItem" key={ed.school}>
                  <div className="aboutEducationTime">{ed.time}</div>
                  <h3 className="aboutEducationTitle">{ed.school}</h3>
                  <p className="aboutEducationDegree">{ed.degree}</p>
                </div>
              ))}
              {data.certificates.length > 0 && (
                <div className="aboutEducationItem">
                  <h3 className="aboutEducationTitle">资格证书</h3>
                  <div className="aboutCertificates">
                    {data.certificates.map((c) => (
                      <span className="aboutCertificate" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="contact" className="aboutSection aboutContactSection">
          <div className="aboutContainer">
            <h2 className="aboutSectionTitle">🚀 一起创造技术的未来</h2>
            <p className="aboutContactSubtitle">
              如果您对技术架构充满热情，想要探索更高效的解决方案，
              <br />
              欢迎与我联系，让我们一起为产品创造更稳定的技术基础！
            </p>
            <div className="aboutContactGrid">
              <div className="aboutContactCard">
                <div className="aboutContactIcon">📱</div>
                <div className="aboutContactCardTitle">联系电话</div>
                <a className="aboutContactCardValue" href={`tel:${data.contact.phone}`}>
                  {data.contact.phone}
                </a>
                <div className="aboutContactCardNote">工作日 9:00-18:00</div>
              </div>
              <div className="aboutContactCard">
                <div className="aboutContactIcon">✉️</div>
                <div className="aboutContactCardTitle">电子邮箱</div>
                <a className="aboutContactCardValue" href={`mailto:${data.contact.email}`}>
                  {data.contact.email}
                </a>
                <div className="aboutContactCardNote">24小时内回复</div>
              </div>
              <div className="aboutContactCard">
                <div className="aboutContactIcon">📍</div>
                <div className="aboutContactCardTitle">所在城市</div>
                <div className="aboutContactCardValue">西安 · 中国</div>
                <div className="aboutContactCardNote">期望工作地点</div>
              </div>
            </div>
            <footer className="aboutFooter">
              © {new Date().getFullYear()} {data.name}. 保留所有权利.
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
