# Secure repository supply chain — progress evidence

**Status: incomplete.** This is an attributed [GitHub Skills exercise copy](https://github.com/skills/secure-repository-supply-chain), with instructor [MIT license](LICENSE) preserved. Evidence recorded 2026-10-13. This intentionally vulnerable instructor repository is isolated training; its legacy application was not installed, executed, or deployed. No package or application safety clearance is claimed.

## Verified progress

- Actual teacher Step 1 required graph enablement and the instructor follow-redirects lockfile entry. Although public graph defaults are described in the lesson, the supervising agent actually observed Dependency graph Off, enabled it, and freshly verified its On state.
- The learner added follow-redirects 1.14.1 to `code/src/AttendeeSite/package-lock.json` on main, commit `e6149597eb0a5ae04048698fe90ac8cb640908b6`, file blob `1c7fd24f5fd92467a786bcb0e664f39bd3512788`.
- Root independently observed 33 dependencies and graph recognition of transitive follow-redirects 1.14.1, minimist 1.2.5, and axios 0.21.1.
- Actual teacher Step 2 then required Dependabot alerts and a manually requested minimist security update.
- Root enabled alerts; the first actual alert list remained empty. Root used the real More Dependabot options / Refresh Dependabot alerts operation to reprocess current source dependencies. It subsequently observed 31 open findings. This is observed source reprocessing, not dismissal or an invented result.
- Root opened [actual minimist alert #5](https://github.com/Khemology/skills-secure-repository-supply-chain/security/dependabot/5): critical CVE-2021-44906 / GHSA-xvch-5gv4-984h, installed 1.2.5, affected >=1.0.0 and <1.2.6, advisory patch 1.2.6. The learner independently read the [official advisory](https://github.com/advisories/GHSA-xvch-5gv4-984h).
- Root clicked Create Dependabot security update once. Later fresh UI still displayed Creating a security update for minimist. No generation error or fix PR was verified at this evidence snapshot.

## Actual generated proposals and distinction

A later connector read found five open PRs authored by dependabot[bot]: [#2](https://github.com/Khemology/skills-secure-repository-supply-chain/pull/2) actions/checkout 6 to 7; [#3](https://github.com/Khemology/skills-secure-repository-supply-chain/pull/3) start-exercise 0.8.1 to 0.9.3; [#4](https://github.com/Khemology/skills-secure-repository-supply-chain/pull/4) finish-exercise 0.7.3 to 0.9.3; [#5](https://github.com/Khemology/skills-secure-repository-supply-chain/pull/5) action-keyphrase-checker 1 to 2; [#6](https://github.com/Khemology/skills-secure-repository-supply-chain/pull/6) find-exercise 0.7.3 to 0.9.3. These are GitHub Actions version updates from the instructor existing monthly github-actions configuration. **None is the requested minimist security update.** No proposal was merged by the learner.

## Remaining work and limits

The actual minimist fix PR must be generated, reviewed, merged using its expected head, and its alert closure independently verified. Security updates remain Off pending actual teacher Step 3. The axios update and Step 4 NuGet weekly version configuration have not been performed. Teacher issue is not claimed complete.

Read-only teacher-workflow inspection showed that Step 2 checks changed minimist versions in package.json and package-lock.json; Step 3 checks changed axios versions. These checks do not by themselves verify bot authorship, settings, alert resolution, compatibility, or remaining findings. Those require separate actual evidence. No handwritten patch was substituted merely to pass the teacher regex.
