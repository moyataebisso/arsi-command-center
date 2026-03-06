interface VercelDeployment {
  deployment_id: string
  state: string
  url: string | null
  commit_message: string | null
  commit_sha: string | null
  branch: string | null
  deployed_at: string | null
}

export async function getVercelDeployments(
  projectId: string,
  teamId: string | null,
  token: string
): Promise<VercelDeployment[]> {
  try {
    let url = `https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`
    if (teamId) url += `&teamId=${teamId}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      console.error(`Vercel API error: ${res.status} ${res.statusText}`)
      return []
    }

    const json = await res.json()
    const deployments = json.deployments ?? []

    return deployments.map((d: Record<string, unknown>) => ({
      deployment_id: d.uid as string,
      state: (d.state as string ?? 'QUEUED').toUpperCase(),
      url: d.url ? `https://${d.url}` : null,
      commit_message: (d.meta as Record<string, unknown>)?.githubCommitMessage as string | null ?? null,
      commit_sha: (d.meta as Record<string, unknown>)?.githubCommitSha as string | null ?? null,
      branch: (d.meta as Record<string, unknown>)?.githubCommitRef as string | null ?? null,
      deployed_at: d.ready ? new Date(d.ready as number).toISOString() : null,
    }))
  } catch (error) {
    console.error('Failed to fetch Vercel deployments:', error)
    return []
  }
}
