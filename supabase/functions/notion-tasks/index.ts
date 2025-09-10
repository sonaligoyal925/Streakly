import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotionTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  deadline: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const notionToken = Deno.env.get('NOTION_TOKEN')
    const notionDatabaseId = Deno.env.get('NOTION_DATABASE_ID')
    
    console.log('Environment check:')
    console.log('NOTION_TOKEN exists:', !!notionToken)
    console.log('NOTION_DATABASE_ID exists:', !!notionDatabaseId)
    console.log('NOTION_DATABASE_ID value:', notionDatabaseId)
    
    if (!notionToken || !notionDatabaseId) {
      throw new Error(`Notion credentials not configured. Token: ${!!notionToken}, Database ID: ${!!notionDatabaseId}`)
    }

    const url = req.url
    const method = req.method
    
    let body = null
    if (method !== 'GET' && method !== 'OPTIONS') {
      try {
        const text = await req.text()
        body = text ? JSON.parse(text) : null
      } catch (error) {
        console.error('Error parsing request body:', error)
        body = null
      }
    }

    const notionHeaders = {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    }

    let response

    switch (method) {
      case 'GET':
        // First, test basic Notion API connectivity
        console.log('Testing Notion API connectivity...')
        const testResponse = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}`, {
          method: 'GET',
          headers: notionHeaders
        })
        
        console.log('Test response status:', testResponse.status)
        
        if (!testResponse.ok) {
          const testErrorText = await testResponse.text()
          console.error('Notion API test error:', testErrorText)
          throw new Error(`Notion API connectivity test failed: ${testResponse.status} - ${testErrorText}`)
        }
        
        const testData = await testResponse.json()
        console.log('Database info:', JSON.stringify(testData, null, 2))
        
        // Fetch all tasks from Notion
        console.log('Making request to Notion API for tasks...')
        console.log('Database ID:', notionDatabaseId)
        
        const notionResponse = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
          method: 'POST',
          headers: notionHeaders,
          body: JSON.stringify({})
        })
        
        console.log('Notion response status:', notionResponse.status)
        
        if (!notionResponse.ok) {
          const errorText = await notionResponse.text()
          console.error('Notion API error:', errorText)
          throw new Error(`Notion API error: ${notionResponse.status} - ${errorText}`)
        }
        
        const data = await notionResponse.json()
        console.log('Raw Notion data:', JSON.stringify(data, null, 2))
        
        if (!data.results) {
          console.error('No results in response:', data)
          throw new Error('No results from Notion API')
        }
        
        console.log('Number of results:', data.results.length)
        
        const tasks = []
        
        for (let i = 0; i < data.results.length; i++) {
          try {
            const page = data.results[i]
            console.log(`Processing page ${i}:`, JSON.stringify(page, null, 2))
            
            if (!page || !page.properties) {
              console.log(`Skipping page ${i} - no properties`)
              continue
            }
            
            const properties = page.properties
            console.log(`Page ${i} properties:`, Object.keys(properties))
            
            const task = {
              id: page.id,
              title: properties.Title?.title?.[0]?.plain_text || properties.Name?.title?.[0]?.plain_text || 'Untitled',
              description: properties.Description?.rich_text?.[0]?.plain_text || '',
              date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
              time: properties.Time?.rich_text?.[0]?.plain_text || '8:00 pm',
              priority: properties.Priority?.select?.name?.toLowerCase() || 'medium',
              status: properties.Status?.select?.name?.toLowerCase() || 'pending',
              deadline: properties.Deadline?.date?.start || new Date().toISOString().split('T')[0]
            }
            
            console.log(`Created task ${i}:`, task)
            tasks.push(task)
            
          } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError)
            console.error(`Page ${i} data:`, JSON.stringify(data.results[i], null, 2))
          }
        }
        
        console.log('Final tasks array:', tasks)
        response = { tasks }
        break

      case 'POST':
        // Create new task in Notion
        const createResponse = await fetch(`https://api.notion.com/v1/pages`, {
          method: 'POST',
          headers: notionHeaders,
          body: JSON.stringify({
            parent: { database_id: notionDatabaseId },
            properties: {
              Title: {
                title: [{ text: { content: body.title } }]
              },
              Description: {
                rich_text: [{ text: { content: body.description || '' } }]
              },
              Date: {
                date: { start: body.date }
              },
              Time: {
                rich_text: [{ text: { content: body.time } }]
              },
              Priority: {
                select: { name: body.priority.charAt(0).toUpperCase() + body.priority.slice(1) }
              },
              Status: {
                select: { name: body.status.charAt(0).toUpperCase() + body.status.slice(1) }
              },
              Deadline: {
                rich_text: [{ text: { content: body.deadline } }]
              }
            }
          })
        })
        
        response = await createResponse.json()
        break

      case 'PATCH':
        // Update task in Notion
        const taskId = body.id
        const updateProps: any = {}
        
        if (body.title) updateProps.Title = { title: [{ text: { content: body.title } }] }
        if (body.description !== undefined) updateProps.Description = { rich_text: [{ text: { content: body.description || '' } }] }
        if (body.date) updateProps.Date = { date: { start: body.date } }
        if (body.time) updateProps.Time = { rich_text: [{ text: { content: body.time } }] }
        if (body.priority) updateProps.Priority = { select: { name: body.priority.charAt(0).toUpperCase() + body.priority.slice(1) } }
        if (body.status) updateProps.Status = { select: { name: body.status.charAt(0).toUpperCase() + body.status.slice(1) } }
        if (body.deadline) updateProps.Deadline = { rich_text: [{ text: { content: body.deadline } }] }
        
        const updateResponse = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
          method: 'PATCH',
          headers: notionHeaders,
          body: JSON.stringify({
            properties: updateProps
          })
        })
        
        response = await updateResponse.json()
        break

      case 'DELETE':
        // Archive task in Notion (Notion doesn't support true delete)
        const deleteTaskId = body.id
        const deleteResponse = await fetch(`https://api.notion.com/v1/pages/${deleteTaskId}`, {
          method: 'PATCH',
          headers: notionHeaders,
          body: JSON.stringify({
            archived: true
          })
        })
        
        response = await deleteResponse.json()
        break

      default:
        throw new Error(`Method ${method} not allowed`)
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})