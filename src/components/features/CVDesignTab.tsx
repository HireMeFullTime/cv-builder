import {ThemeSettings} from '@/types';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

import { CVDesignTabProps } from '@/types';

export function CVDesignTab({layout, onChange}: CVDesignTabProps) {
	return (
		<div className='p-6 space-y-6'>
			<div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
				<div className='space-y-2'>
					<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Typography</Label>
					<Select
						value={layout.theme?.fontFamily || 'sans'}
						onValueChange={(v: ThemeSettings['fontFamily']) =>
							onChange({...layout, theme: {...layout.theme!, fontFamily: v}})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select Font' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='sans'>Modern (Sans-serif)</SelectItem>
							<SelectItem value='serif'>Classic (Serif)</SelectItem>
							<SelectItem value='mono'>Technical (Monospace)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Font Size</Label>
					<Select
						value={layout.theme?.fontSize || 'base'}
						onValueChange={(v: ThemeSettings['fontSize']) =>
							onChange({...layout, theme: {...layout.theme!, fontSize: v}})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select Size' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='sm'>Small</SelectItem>
							<SelectItem value='base'>Normal</SelectItem>
							<SelectItem value='lg'>Large</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='space-y-2'>
					<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Item Spacing</Label>
					<Select
						value={layout.theme?.spacing || 'normal'}
						onValueChange={(v: ThemeSettings['spacing']) =>
							onChange({...layout, theme: {...layout.theme!, spacing: v}})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select Spacing' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='compact'>Compact</SelectItem>
							<SelectItem value='normal'>Normal</SelectItem>
							<SelectItem value='relaxed'>Relaxed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className='col-span-1 sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8 mt-2'>
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
								Doc Padding
							</Label>
							<span className='text-xs text-muted-foreground'>{layout.theme?.documentMargins ?? 32}px</span>
						</div>
						<input
							type='range'
							min='12'
							max='64'
							step='4'
							value={layout.theme?.documentMargins ?? 32}
							onChange={e => onChange({...layout, theme: {...layout.theme!, documentMargins: Number(e.target.value)}})}
							className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
						/>
					</div>

					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
								Section Gap
							</Label>
							<span className='text-xs text-muted-foreground'>{layout.theme?.sectionSpacing ?? 24}px</span>
						</div>
						<input
							type='range'
							min='8'
							max='64'
							step='4'
							value={layout.theme?.sectionSpacing ?? 24}
							onChange={e => onChange({...layout, theme: {...layout.theme!, sectionSpacing: Number(e.target.value)}})}
							className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
						/>
					</div>

					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<Label className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>Column Gap</Label>
							<span className='text-xs text-muted-foreground'>{layout.theme?.columnSpacing ?? 24}px</span>
						</div>
						<input
							type='range'
							min='8'
							max='64'
							step='4'
							value={layout.theme?.columnSpacing ?? 24}
							onChange={e => onChange({...layout, theme: {...layout.theme!, columnSpacing: Number(e.target.value)}})}
							className='w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-black'
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
