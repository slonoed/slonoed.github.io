import React from 'react';
import { Link, graphql } from 'gatsby';
import get from 'lodash/get';

import '../fonts/fonts-post.css';
import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import Panel from '../components/panel';
import AltLang from '../components/alt-lang';
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

    const langKey = post.fields.langKey;

    const siteUrl = this.props.data.site.siteMetadata.siteUrl;
    let html = post.html;

    loadFontsForCode('en');

    if (langKey === 'ru') {
      loadFontsForCode('ru');
    }

    const altPost = this.props.data.altPost;

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          lang={langKey}
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
                {formatPostDate(post.frontmatter.date, langKey)}
                {` • ${formatReadingTime(post.timeToRead, langKey)}`}
                {altPost && (
                  <span>
                    {' • '}
                    <AltLang
                      langKey={altPost.fields.langKey}
                      slug={altPost.fields.slug}
                    />
                  </span>
                )}
              </p>
            </header>
            <div dangerouslySetInnerHTML={{ __html: html }} />
            <hr />
            <PostFooter slug={slug} siteUrl={siteUrl} lang={langKey} />
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
          <Bio langKey={langKey} />
        </aside>
      </Layout>
    );
  }
}

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!, $altSlug: String!) {
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
    altPost: markdownRemark(fields: { slug: { eq: $altSlug } }) {
      id
      fields {
        slug
        langKey
      }
    }
  }
`;
