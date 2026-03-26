import type { Metadata } from "next";
import Link from "next/link";

import { philosophyStringsData } from "@/data";

export const metadata: Metadata = { title: philosophyStringsData.metadataTitle };

const PhilosophyPage = () => (
    <div>
        <h1>{philosophyStringsData.title}</h1>
        <p>
            <strong>{philosophyStringsData.pluginName}</strong>
            {philosophyStringsData.intro}
        </p>
        <h2 id="filling-the-gaps">{philosophyStringsData.fillingGapsTitle}</h2>
        <p>{philosophyStringsData.fillingGapsDescription1}</p>
        <p>{philosophyStringsData.fillingGapsDescription2}</p>
        <h2 id="self-sufficient-rules">{philosophyStringsData.selfSufficientTitle}</h2>
        <p>{philosophyStringsData.selfSufficientDescription1}</p>
        <p>{philosophyStringsData.selfSufficientDescription2}</p>
        <h2 id="auto-fix-first">{philosophyStringsData.autoFixTitle}</h2>
        <p>
            {philosophyStringsData.autoFixDescription1}
            <code>{philosophyStringsData.autoFixDescription1Code}</code>
            {philosophyStringsData.autoFixDescription1Suffix}
        </p>
        <p>{philosophyStringsData.autoFixDescription2}</p>
        <h2 id="consistency-at-scale">{philosophyStringsData.consistencyTitle}</h2>
        <p>{philosophyStringsData.consistencyDescription1}</p>
        <p>{philosophyStringsData.consistencyDescription2}</p>
        <h2 id="opinionated-but-configurable">{philosophyStringsData.opinionatedTitle}</h2>
        <p>{philosophyStringsData.opinionatedDescription1}</p>
        <ul>
            <li>
                <code>{philosophyStringsData.opinionatedExample1Code}</code>
                {philosophyStringsData.opinionatedExample1Text}
            </li>
            <li>
                <code>{philosophyStringsData.opinionatedExample2Code}</code>
                {philosophyStringsData.opinionatedExample2Text}
            </li>
            <li>
                <code>{philosophyStringsData.opinionatedExample3Code}</code>
                {philosophyStringsData.opinionatedExample3Text}
            </li>
        </ul>
        <p>{philosophyStringsData.opinionatedDescription2}</p>
        <h2 id="naming-conventions">{philosophyStringsData.namingConventionsTitle}</h2>
        <p>{philosophyStringsData.namingConventionsDescription1}</p>
        <p>
            {philosophyStringsData.namingConventionsDescription2Prefix}
            <code>{philosophyStringsData.namingConventionsDescription2UseAuth}</code>
            {philosophyStringsData.namingConventionsDescription2UseAuthSuffix}
            <code>{philosophyStringsData.namingConventionsDescription2UseAuthFile}</code>
            {philosophyStringsData.namingConventionsDescription2UseAuthFileSuffix}
            <code>{philosophyStringsData.namingConventionsDescription2Is}</code>
            {philosophyStringsData.namingConventionsDescription2IsSuffix}
            <code>{philosophyStringsData.namingConventionsDescription2Has}</code>
            {philosophyStringsData.namingConventionsDescription2HasSuffix}
        </p>
        <h2 id="react-first">{philosophyStringsData.reactFirstTitle}</h2>
        <p>{philosophyStringsData.reactFirstDescription1}</p>
        <p>{philosophyStringsData.reactFirstDescription2}</p>
        <h2 id="works-alongside-existing-tools">{philosophyStringsData.worksAlongsideTitle}</h2>
        <p>
            {philosophyStringsData.worksAlongsideDescription1}
            <code>{philosophyStringsData.worksAlongsideDescription1Code1}</code>
            {philosophyStringsData.worksAlongsideDescription1Connector}
            <code>{philosophyStringsData.worksAlongsideDescription1Code2}</code>
            {philosophyStringsData.worksAlongsideDescription1Suffix}
        </p>
        <p>{philosophyStringsData.worksAlongsideDescription2}</p>
        <h2 id="next-steps">{philosophyStringsData.nextStepsTitle}</h2>
        <ul>
            <li>
                <Link href="/docs/getting-started">{philosophyStringsData.nextStepsGettingStarted}</Link>
                {philosophyStringsData.nextStepsGettingStartedSuffix}
            </li>
            <li>
                <Link href="/docs/rules">{philosophyStringsData.nextStepsRulesReference}</Link>
                {philosophyStringsData.nextStepsRulesReferenceSuffix}
            </li>
            <li>
                <Link href="/docs/contributing">{philosophyStringsData.nextStepsContributing}</Link>
                {philosophyStringsData.nextStepsContributingSuffix}
            </li>
        </ul>
    </div>
);

// eslint-disable-next-line import-x/no-default-export
export default PhilosophyPage;
