import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    displayName: 'CTA';
    icon: 'cursor';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
    text: Schema.Attribute.Text;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    icon: 'picture';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
    media: Schema.Attribute.Media<'images'>;
    subheading: Schema.Attribute.Text;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    displayName: 'Rich Text';
    icon: 'align-left';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface BlocksStats extends Struct.ComponentSchema {
  collectionName: 'components_blocks_stats';
  info: {
    displayName: 'Stats';
    icon: 'chartBar';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'shared.stat', true>;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    style: Schema.Attribute.Enumeration<['primary', 'outline', 'ghost']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonical: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSpec extends Struct.ComponentSchema {
  collectionName: 'components_shared_specs';
  info: {
    displayName: 'Spec';
    icon: 'bulletList';
  };
  attributes: {
    display: Schema.Attribute.Enumeration<['text', 'number', 'bar', 'donut']> &
      Schema.Attribute.DefaultTo<'text'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    percent: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    unit: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    displayName: 'Stat';
    icon: 'chartBubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cta': BlocksCta;
      'blocks.hero': BlocksHero;
      'blocks.rich-text': BlocksRichText;
      'blocks.stats': BlocksStats;
      'shared.link': SharedLink;
      'shared.seo': SharedSeo;
      'shared.spec': SharedSpec;
      'shared.stat': SharedStat;
    }
  }
}
