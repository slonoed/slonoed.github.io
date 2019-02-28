import React from 'react';
import { Link, graphql } from 'gatsby';
import get from 'lodash/get';

import '../fonts/fonts-post.css';
import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Panel from '../components/panel';
import { formatPostDate, formatReadingTime } from '../utils/helpers';
import { rhythm, scale } from '../utils/typography';
import {
  codeToLanguage,
  createLanguageLink,
  loadFontsForCode,
} from '../utils/i18n';

const GITHUB_USERNAME = 'gaearon';
const GITHUB_REPO_NAME = 'overreacted.io';
const systemFont = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif`;

const PostFooter = ({ slug, siteUrl, lang }) => {
  const twitterText = `@slonoed ${siteUrl}${slug}`;
  const twitterHref =
    'http://twitter.com/home?status=' + encodeURIComponent(twitterText);
  const text =
    lang === 'ru'
      ? 'Если у вас есть вопросы или вы хотите обсудить текст, то напишите мне в '
      : 'If you have any questions or want to discuss this text, please reach me in ';

  return (
    <footer>
      {text} <a href={twitterHref}>twitter</a>.
    </footer>
  );
};

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark;
    const siteTitle = get(this.props, 'data.site.siteMetadata.title');
    let {
      previous,
      next,
      slug,
      translations,
      translatedLinks,
    } = this.props.pageContext;
    const lang = post.fields.langKey;

    const siteUrl = this.props.data.site.siteMetadata.siteUrl;
    // Replace original links with translated when available.
    let html = post.html;

    translations = [];
    translations.sort((a, b) => {
      return codeToLanguage(a) < codeToLanguage(b) ? -1 : 1;
    });

    loadFontsForCode('ru');
    loadFontsForCode('en');
    const languageLink = '';

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          lang={lang}
          title={post.frontmatter.title}
          description={post.frontmatter.description}
          slug={post.fields.slug}
        />
        <main>
          <article>
            <header>
              <h1 style={{ color: 'var(--textTitle)' }}>
                {post.frontmatter.title}
              </h1>
              <p
                style={{
                  ...scale(-1 / 5),
                  display: 'block',
                  marginBottom: rhythm(1),
                  marginTop: rhythm(-4 / 5),
                }}
              >
                {formatPostDate(post.frontmatter.date, lang)}
                {` • ${formatReadingTime(post.timeToRead)}`}
              </p>
            </header>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            <hr />
            <PostFooter slug={slug} siteUrl={siteUrl} lang={lang} />
          </article>
        </main>
        <aside>
          <div
            style={{
              margin: '90px 0 40px 0',
              fontFamily: systemFont,
            }}
          />
          <h3
            style={{
              fontFamily: 'Montserrat, sans-serif',
              marginTop: rhythm(0.25),
            }}
          >
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
              }}
              to={'/'}
            >
              slonoed
            </Link>
          </h3>
          <Bio />
        </aside>
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
      fields {
        slug
        langKey
      }
    }
  }
`;
