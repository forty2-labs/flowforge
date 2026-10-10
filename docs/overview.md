# Overview

## What Flowforge is

Flowforge is a schema-driven CMS and experience platform: one place to manage
the content and layouts of a business's website, and later its apps. It should
work the same for a publisher, a café, a shop or an agency.

The source of truth for the product is the
[Flowforge product design package](https://claude.ai/artifact/RkqQHGTZHv4QQcumDyRoqi).
Its v2 pages are current. Its v1 pages describe an earlier agency-focused
product and are kept for reference only.

## The model

```
Account → Workspace → Experience → Page → Section → references Entries
```

| Term | Meaning |
| --- | --- |
| Workspace | A business or project. It owns members, roles, content types, entries, media, experiences and settings. |
| Content type | A schema: a list of fields. The editor for an entry is generated from it. |
| Entry | One piece of content of a given type. Entries belong to the workspace, not to a page, so any experience can reuse them. |
| Experience | A website now, an app later. It holds pages and navigation menus. |
| Page | An entry of type Page, plus a layout that belongs to one experience. |
| Section | One block in a page layout, such as a hero or an article list. Sections are configuration for registered components and reference entries by ID or by query. No executable code is stored. |

Every entry and page has a working draft and, once published, a published
snapshot. The live site reads only published snapshots. Publishing is a single
step through a review screen.

## Roles

There are five fixed roles: Owner, Admin, Editor, Author and Viewer. What each
may do is defined once, in
[packages/types/src/roles.ts](../packages/types/src/roles.ts).

## Phases

| # | Phase | Delivers | Status |
| --- | --- | --- | --- |
| 1 | Foundations | Monorepo, design tokens, accounts, workspaces, members, invitations, role guard, CI | Built |
| 2 | Content models and Content Studio | Content types, generated editor, entries with drafts, content list, media library | Next |
| 3 | Experiences and Experience Builder | Website experience, pages, section registry, layouts, navigation menus | |
| 4 | Publishing and the live site | Draft and published snapshots, releases, review screen, preview, site renderer, rollback, delivery API | |
| 5 | Workspace shell | Overview dashboard, onboarding, remaining settings, empty and error states | |
| 6 | AI assistant | AI actions inside rich-text and SEO fields, usage logging and quotas | |
| 7 | Hardening | Accessibility audit, performance pass, domains, API keys | |
| 8 | Mobile app | Scope still to be settled | |

Phases 2 to 4 depend on each other in order. Phases 5 and 6 only need phase 2.

## Scope decisions

- Approval workflows, the content calendar, analytics, library search and
  billing are out of scope for now.
- Sites start on subdomains because that is simpler. Custom domains are the
  long-term preference, so the data model must not rule them out.

## Known gaps in phase 1

- No mail provider is connected. Invitation links are shown to the inviter and
  written to the API log.
- Google sign-in, email verification, password reset and sign-in rate limiting
  are not built.
- Dialog and toast components are not built.
