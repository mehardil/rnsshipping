const API = 'https://api.github.com'

export function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
  }
}

export function githubConfigured() {
  const config = githubConfig()
  return Boolean(config.token && config.repo)
}

function headers(token) {
  return {
    authorization: `Bearer ${token}`,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'rns-shipping-portal',
  }
}

async function request(path, options = {}) {
  const config = githubConfig()
  const response = await fetch(`${API}${path}`, { ...options, headers: { ...headers(config.token), ...(options.headers || {}) } })
  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = { message: text } }
  if (!response.ok && response.status !== 404) {
    const message = data?.message || `GitHub request failed (${response.status})`
    throw new Error(message)
  }
  return { response, data }
}

export async function getFile(path) {
  const config = githubConfig()
  const { response, data } = await request(`/repos/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(config.branch)}`)
  if (response.status === 404) return null
  return data
}

export async function putFile(path, content, message) {
  const config = githubConfig()
  if (!githubConfigured()) throw new Error('GitHub publishing is not configured. Add GITHUB_TOKEN and GITHUB_REPO.')
  const existing = await getFile(path)
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: config.branch,
  }
  if (existing?.sha) body.sha = existing.sha
  const { data } = await request(`/repos/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  return { sha: data?.content?.sha, commitUrl: data?.commit?.html_url }
}

export async function deleteFile(path, message) {
  const config = githubConfig()
  const existing = await getFile(path)
  if (!existing?.sha) return null
  const { data } = await request(`/repos/${config.repo}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha: existing.sha, branch: config.branch }),
  })
  return data?.commit?.html_url || null
}

export async function triggerBuild() {
  const hook = process.env.NETLIFY_BUILD_HOOK
  if (!hook) return false
  const response = await fetch(hook, { method: 'POST' })
  return response.ok
}
