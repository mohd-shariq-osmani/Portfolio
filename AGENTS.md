# Project Guidelines & Git Workflow Rules

Always adhere strictly to the following rules for this project:

1. **No Automatic Commits / Push:**
   - Never commit or push to GitHub automatically after making changes.
   - Always ask for explicit user confirmation before executing any `git commit` or `git push`.

2. **Verify Build Success Before Committing:**
   - Before proposing a commit, verify that the GitHub Actions build will succeed.
   - Run `npm run build` (and ensure dependencies/types pass) to catch any errors before committing.

3. **Confirm Simple Commit Subjects:**
   - Propose and confirm the subject/message of the commit with the user first.
   - Keep the commit message simple, clean, and straightforward—nothing complicated.
