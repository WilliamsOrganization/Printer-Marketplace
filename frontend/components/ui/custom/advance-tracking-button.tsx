'use client'

import * as React from 'react'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Shipping } from '@/lib/types'
import { Button } from '@/components/ui/button'
import type { ShippedOrder } from './shipments-table'

export function AdvanceTrackingButton({
	order,
	onAdvanced,
}: {
	order: ShippedOrder
	onAdvanced: (shipping: Shipping) => void
}) {
	const [loading, setLoading] = React.useState(false)

	const advance = () => {
		setLoading(true)
		api
			.post<Shipping>(`/mock-shippo/${order.id}/advance`)
			.then((res) => {
				toast.success(`Order #${order.id} advanced to ${res.data.status}`)
				onAdvanced(res.data)
			})
			.catch((err) => {
				const reason = isAxiosError(err) && typeof err.response?.data === 'string'
					? err.response.data
					: err.message
				toast.error('Failed to advance tracking: ' + reason)
			})
			.finally(() => setLoading(false))
	}

	return (
		<Button variant="ghost" size="sm" onClick={advance} disabled={loading}>
			{loading ? 'Advancing…' : 'Advance'}
		</Button>
	)
}

export default AdvanceTrackingButton
