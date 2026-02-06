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
            <a href="#projects">项目</a>
            <a href="#skills">技能</a>
            <a href="#experience">经历</a>
            <a href="#education">教育</a>
            <a href="#contact">联系</a>
          </nav>
          <a className="aboutBtn" href={data.resumePdfUrl} target="_blank" rel="noreferrer">
            查看PDF
          </a>
        </div>
      </header>

      <main id="top" className="aboutMain">
        <section className="aboutHero">
          <div className="aboutContainer aboutHeroInner">
            <div>
              <div className="aboutKicker">{data.title}</div>
              <h1 className="aboutTitle">{data.name}</h1>
              <p className="aboutSubTitle">{data.meta}</p>
              <div className="aboutActions">
                <a className="aboutBtnPrimary" href="#contact">
                  联系我
                </a>
                <a className="aboutBtnGhost" href="#projects">
                  查看项目
                </a>
              </div>
            </div>
            <div className="aboutCard aboutHeroCard">
              <div className="aboutCardTitle">个人优势</div>
              <ul className="aboutList">
                {data.highlights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="projects" className="aboutSection">
          <div className="aboutContainer">
            <div className="aboutSectionTitle">精选项目</div>
            <div className="aboutGrid3">
              {data.projects.map((p) => (
                <div className="aboutCard" key={p.name}>
                  <div className="aboutCardHeading">{p.name}</div>
                  <div className="aboutCardDesc">{p.desc}</div>
                  <div className="aboutTags">
                    {p.tags.map((tag) => (
                      <span className="aboutTag" key={tag}>
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
            <div className="aboutSectionTitle">技能</div>
            <div className="aboutGrid2">
              {data.skills.map((g) => (
                <div className="aboutCard" key={g.group}>
                  <div className="aboutCardHeading">{g.group}</div>
                  <div className="aboutPills">
                    {g.items.map((it) => (
                      <span className="aboutPill" key={it}>
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
            <div className="aboutSectionTitle">工作经历</div>
            <div className="aboutStack">
              {data.experience.map((e) => (
                <div className="aboutCard" key={e.company}>
                  <div className="aboutRow">
                    <div className="aboutCardHeading">{e.company}</div>
                    <div className="aboutMuted">{e.time}</div>
                  </div>
                  <ul className="aboutList">
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
            <div className="aboutSectionTitle">教育经历</div>
            <div className="aboutGrid2">
              {data.education.map((ed) => (
                <div className="aboutCard" key={ed.school}>
                  <div className="aboutRow">
                    <div className="aboutCardHeading">{ed.school}</div>
                    <div className="aboutMuted">{ed.time}</div>
                  </div>
                  <div className="aboutCardDesc">{ed.degree}</div>
                </div>
              ))}
              <div className="aboutCard">
                <div className="aboutCardHeading">资格证书</div>
                <div className="aboutPills">
                  {data.certificates.map((c) => (
                    <span className="aboutPill" key={c}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="aboutSection">
          <div className="aboutContainer">
            <div className="aboutSectionTitle">联系</div>
            <div className="aboutCard">
              <div className="aboutContactGrid">
                <div>
                  <div className="aboutContactLabel">手机号</div>
                  <div className="aboutContactValue">{data.contact.phone}</div>
                </div>
                <div>
                  <div className="aboutContactLabel">邮箱</div>
                  <div className="aboutContactValue">
                    <a className="aboutLink" href={`mailto:${data.contact.email}`}>
                      {data.contact.email}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="aboutContactLabel">简历PDF</div>
                  <div className="aboutContactValue">
                    <a className="aboutLink" href={data.resumePdfUrl} target="_blank" rel="noreferrer">
                      打开 / 下载
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <footer className="aboutFooter">© {new Date().getFullYear()} {data.name}. 保留所有权利。</footer>
          </div>
        </section>
      </main>
    </div>
  );
}
