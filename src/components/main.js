import React from 'react';
import { Link, graphql } from 'gatsby';

import Bio from './bio';
import Layout from './layout';
import SEO from './seo';
import { rhythm } from '../utils/typography';
import { formatPostDate, formatReadingTime } from '../utils/helpers';

const Main = ({ data, location, langKey }) => {
  const siteTitle = data.site.siteMetadata.title;
  const posts = data.allMarkdownRemark.edges;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" keywords={[`blog`, `javascript`, `react`]} />
      <Bio langKey={langKey} />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug;
        return (
          <article key={node.fields.slug}>
            <header>
              <h3
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: rhythm(1),
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link
                  rel="bookmark"
                  style={{ boxShadow: `none` }}
                  to={node.fields.slug}
                >
                  {title}
                </Link>
              </h3>
              <small>
                {formatPostDate(node.frontmatter.date, node.fields.langKey)}
                {` • ${formatReadingTime(node.timeToRead)}`}
              </small>
            </header>
            <p
              dangerouslySetInnerHTML={{
                __html: node.frontmatter.description || node.excerpt,
              }}
            />
          </article>
        );
      })}
    </Layout>
  );
};

export default Main;
