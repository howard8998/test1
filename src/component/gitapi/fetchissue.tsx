import axios from 'axios'
import getuser from '../../component/gitapi/getuser'
interface User {
  issues: {
    nodes: Issue[]
    pageInfo: {
      endCursor: string
      hasNextPage:boolean
    }
  }
}
interface GraphQLResponse {
  data: {
    user: User
  }
}
interface Issue {
  number: number
  title: string
  url: string
  state: string
  createdAt: string
  updatedAt: string
  body: string
  repository: {
    nameWithOwner: string
    url: string
  }
  
}
async function getissue(
  accessToken: string,
  username: string,
  endcourse: String,
): Promise<User | undefined> {
  const query = `
    query ($username: String!, $endcourse: String) {
      user(login: $username) {
        issues(first: 10,after: $endcourse ,states:[OPEN],orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
            state
            createdAt
            updatedAt
            body
            repository {
              nameWithOwner
              url
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `

  try {
    let variables: any = { username }
    if (endcourse !== '') {
      variables.endcourse = endcourse
    }
    const response = await axios.post<GraphQLResponse>(
      'https://api.github.com/graphql',
      {
        query,
        variables,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
    
    return response.data.data.user
  } catch (error) {
    console.error(error)
    return undefined
  }
}

const getIssue = async (newEndCursor: string) => {
  await getuser()
  if (sessionStorage) {
    const accessToken = sessionStorage.getItem('accessToken')
    const username = sessionStorage.getItem('username')
    if (accessToken && username) {
      return await getissue(accessToken, username, newEndCursor)
    } else {
      console.log('User not found')
      return undefined
    }
  }
}

export default getIssue
