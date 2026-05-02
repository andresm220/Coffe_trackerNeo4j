import { NextResponse } from 'next/server'
import { runQuery } from '@/lib/neo4j'

const LABELS = ['Cafeteria', 'Finca', 'Lote', 'Productor', 'Tostador', 'Beneficio', 'Transporte', 'Certificacion']

function getIdField(label: string): string {
  const map: Record<string, string> = {
    Cafeteria: 'cafeteria_id', Finca: 'finca_id', Lote: 'lote_id',
    Productor: 'productor_id', Tostador: 'tostador_id', Beneficio: 'beneficio_id',
    Transporte: 'transporte_id', Certificacion: 'cert_id',
  }
  return map[label] || 'id'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const label = searchParams.get('label') || 'Cafeteria'
    if (!LABELS.includes(label)) return NextResponse.json({ error: 'Label no válido' }, { status: 400 })
    const records = await runQuery(`MATCH (n:${label}) RETURN properties(n) AS n, elementId(n) AS eid ORDER BY eid DESC LIMIT 200`)
    return NextResponse.json(records.map((r) => (r as Record<string, unknown>).n))
  } catch (error) {
    console.error('[GET /api/admin/nodos]', error)
    return NextResponse.json({ error: 'Error al consultar nodos' }, { status: 500 })
  }
}

// CREATE — soporta 1 o más labels
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      labels?: string[]
      label?: string
      properties: Record<string, unknown>
    }
    const labels = (body.labels && body.labels.length > 0) ? body.labels : (body.label ? [body.label] : [])
    if (!labels.length || !labels.every(l => LABELS.includes(l))) {
      return NextResponse.json({ error: 'Label(s) no válido(s)' }, { status: 400 })
    }
    const labelStr = labels.join(':')
    const records = await runQuery(`CREATE (n:${labelStr} $props) RETURN properties(n) AS n`, { props: body.properties })
    return NextResponse.json((records[0] as Record<string, unknown>).n, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/nodos]', error)
    return NextResponse.json({ error: 'Error al crear nodo' }, { status: 500 })
  }
}

// UPDATE — un nodo (null en props elimina la propiedad)
export async function PUT(request: Request) {
  try {
    const { label, id_value, properties } = await request.json() as {
      label: string; id_value: string; properties: Record<string, unknown>
    }
    if (!LABELS.includes(label)) return NextResponse.json({ error: 'Label no válido' }, { status: 400 })
    const idf = getIdField(label)
    const records = await runQuery(
      `MATCH (n:${label}) WHERE n.${idf} = $id_value SET n += $props RETURN properties(n) AS n`,
      { id_value, props: properties }
    )
    if (records.length === 0) return NextResponse.json({ error: 'Nodo no encontrado' }, { status: 404 })
    return NextResponse.json((records[0] as Record<string, unknown>).n)
  } catch (error) {
    console.error('[PUT /api/admin/nodos]', error)
    return NextResponse.json({ error: 'Error al actualizar nodo' }, { status: 500 })
  }
}

// BULK UPDATE — múltiples nodos (null en props elimina la propiedad)
export async function PATCH(request: Request) {
  try {
    const { label, id_values, properties } = await request.json() as {
      label: string; id_values: string[]; properties: Record<string, unknown>
    }
    if (!LABELS.includes(label)) return NextResponse.json({ error: 'Label no válido' }, { status: 400 })
    if (!id_values?.length) return NextResponse.json({ error: 'Se requieren id_values' }, { status: 400 })
    const idf = getIdField(label)
    const result = await runQuery(
      `MATCH (n:${label}) WHERE n.${idf} IN $id_values SET n += $props RETURN count(n) AS updated`,
      { id_values, props: properties }
    )
    return NextResponse.json({ updated: (result[0] as Record<string, unknown>).updated })
  } catch (error) {
    console.error('[PATCH /api/admin/nodos]', error)
    return NextResponse.json({ error: 'Error al actualizar nodos' }, { status: 500 })
  }
}

// DELETE — 1 nodo o múltiples (id_value ó id_values)
export async function DELETE(request: Request) {
  try {
    const { label, id_value, id_values } = await request.json() as {
      label: string; id_value?: string; id_values?: string[]
    }
    if (!LABELS.includes(label)) return NextResponse.json({ error: 'Label no válido' }, { status: 400 })
    const idf = getIdField(label)
    if (id_values && id_values.length > 0) {
      await runQuery(
        `MATCH (n:${label}) WHERE n.${idf} IN $id_values DETACH DELETE n`,
        { id_values }
      )
    } else if (id_value) {
      await runQuery(
        `MATCH (n:${label}) WHERE n.${idf} = $id_value DETACH DELETE n`,
        { id_value }
      )
    } else {
      return NextResponse.json({ error: 'Se requiere id_value o id_values' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/admin/nodos]', error)
    return NextResponse.json({ error: 'Error al eliminar nodo(s)' }, { status: 500 })
  }
}
