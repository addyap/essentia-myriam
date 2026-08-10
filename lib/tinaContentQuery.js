// Hand-committed copy of the `content` GraphQL query TinaCMS generates from
// tina/config.js (see tina/__generated__/types.js, which is gitignored and
// only exists after `tinacms build`/`dev` has run). Providers.js needs this
// exact string at all times — including a fresh Vercel build before Tina's
// codegen step runs — to hand to useTina() for live-preview reactivity, so
// it's kept here as a normal source file instead of depending on the
// generated one.
//
// useTina() correlates its live-preview subscription with the Tina admin by
// hashing this string character-for-character (see hashFromQuery in
// @tinacms/bridge) — NOT by parsing it as GraphQL — so it must stay
// byte-identical to the generated ContentDocument. If tina/config.js's
// `content` collection schema changes, regenerate (`npm run dev` once) and
// paste tina/__generated__/types.js's ContentPartsFragmentDoc + ContentDocument
// template literals back in below, in the same order.
const ContentPartsFragmentDoc = `
    fragment ContentParts on Content {
  __typename
  brand {
    __typename
    essentia {
      __typename
      name
      sub
      byline
    }
    aletheias {
      __typename
      name
      sub
    }
  }
  ui {
    __typename
    language
    book
    discover
    send
    menu
    formUnavailable
    legalFrenchOnly
  }
  nav {
    __typename
    home
    about
    coaching
    rh
    resources
    contact
  }
  footer {
    __typename
    explore
    contact
    legal
    legalNotice
    privacy
    rgpd
    ethics
    blurb
    tagline
    rights
  }
  home {
    __typename
    heroKicker
    heroTitle
    heroSub
    heroCta1
    heroCta2
    introEyebrow
    introTitle
    introBody
    pillarsEyebrow
    pillars {
      __typename
      ic
      t
      d
    }
    forEyebrow
    forTitle
    forWho {
      __typename
      ic
      t
      d
    }
    testiEyebrow
    testiTitle
    testi {
      __typename
      q
      w
    }
    bandTitle
    bandText
    bandBtn
  }
  about {
    __typename
    eyebrow
    title
    lead
    photoCaption
    p1
    p2
    journeyTitle
    journeyBody
    valuesTitle
    valuesSub
    values {
      __typename
      ic
      t
      d
    }
    whyTitle
    whyBody
    langsTitle
  }
  coaching {
    __typename
    eyebrow
    title
    lead
    listTitle
    items {
      __typename
      ic
      t
      d
    }
    methodsEyebrow
    methodsTitle
    methodsSub
    methods
    pricingEyebrow
    pricingTitle
    pricingSub
    prices {
      __typename
      t
      amt
      per
      feat
    }
  }
  rh {
    __typename
    eyebrow
    title
    lead
    items {
      __typename
      ic
      t
      d
    }
    approachTitle
    approachBody
    ctaTitle
    ctaBtn
  }
  booking {
    __typename
    eyebrow
    title
    lead
    fName
    fEmail
    fType
    fMsg
    opt
    send
    calTitle
    calNote
    payNote
    coordsTitle
    weekdays
    address
    waGreeting
  }
  resources {
    __typename
    eyebrow
    title
    lead
    tabs
    items {
      __typename
      cat
      ic
      t
      d
    }
    newsTitle
    newsSub
    newsBtn
    newsPlace
  }
  contact {
    __typename
    eyebrow
    title
    lead
    fName
    fEmail
    fSubject
    fMsg
    send
    infoTitle
    hoursTitle
    hours
    whatsapp
  }
  notFound {
    __typename
    eyebrow
    title
    text
    backBtn
  }
}
    `;

export const CONTENT_QUERY = `
    query content($relativePath: String!) {
  content(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ContentParts
  }
}
    ${ContentPartsFragmentDoc}`;
