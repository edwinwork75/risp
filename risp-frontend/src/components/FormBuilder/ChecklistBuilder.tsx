import React from 'react';
import { ChecklistConfig, ChecklistColumn, ChecklistSection, ChecklistRow, ChecklistInput } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Settings2, GripVertical, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ChecklistBuilderProps {
    config?: ChecklistConfig;
    onChange: (config: ChecklistConfig) => void;
}

// --- Sortable Components ---

interface SortableInputItemProps {
    input: ChecklistInput;
    columnId: string;
    onUpdate: (id: string, updates: Partial<ChecklistInput>) => void;
    onRemove: (id: string) => void;
}

const SortableInputItem = ({ input, columnId, onUpdate, onRemove }: SortableInputItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: input.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center bg-gray-50 p-2 rounded-md border group">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical className="h-4 w-4" />
            </div>
            <Select value={input.type} onValueChange={(val: any) => onUpdate(input.id, { type: val })}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                </SelectContent>
            </Select>
            <Input
                value={input.label}
                onChange={(e) => onUpdate(input.id, { label: e.target.value })}
                placeholder="Label"
                className="h-8 text-xs"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(input.id)}>
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
};

interface SortableColumnItemProps {
    column: ChecklistColumn;
    onUpdate: (id: string, updates: Partial<ChecklistColumn>) => void;
    onRemove: (id: string) => void;
    onAddInput: (colId: string) => void;
    onUpdateInput: (colId: string, inputId: string, updates: Partial<ChecklistInput>) => void;
    onRemoveInput: (colId: string, inputId: string) => void;
}

const SortableColumnItem = ({ column, onUpdate, onRemove, onAddInput, onUpdateInput, onRemoveInput }: SortableColumnItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card>
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                    <div className='flex gap-2 items-start w-full pr-4'>
                        <div {...attributes} {...listeners} className="mt-2 cursor-grab text-gray-400 hover:text-gray-600">
                            <GripVertical className="h-5 w-5" />
                        </div>
                        <div className='w-full space-y-2'>
                            <div className='flex justify-between items-center'>
                                <Label className="text-xs text-muted-foreground uppercase">Column Name</Label>
                                <Badge variant={column.type === 'info' ? 'secondary' : 'default'} className="text-[10px]">
                                    {column.type === 'info' ? 'Static Info' : 'Input Role'}
                                </Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={column.name}
                                    onChange={(e) => onUpdate(column.id, { name: e.target.value })}
                                    className="font-medium flex-grow"
                                />
                                <Select
                                    value={column.type || 'input'}
                                    onValueChange={(val: any) => onUpdate(column.id, { type: val })}
                                >
                                    <SelectTrigger className="w-[90px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="input">Role</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="-mt-1 -mr-2" onClick={() => onRemove(column.id)}>
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {column.type !== 'info' && (
                        <>
                            <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={column.capabilities.allowComments}
                                        onCheckedChange={(c) => onUpdate(column.id, { capabilities: { ...column.capabilities, allowComments: c } })}
                                    />
                                    <span>Comments</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={column.capabilities.allowAttachments}
                                        onCheckedChange={(c) => onUpdate(column.id, { capabilities: { ...column.capabilities, allowAttachments: c } })}
                                    />
                                    <span>Files</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase">Inputs</Label>
                                <SortableContext items={column.inputs.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {column.inputs.map(input => (
                                        <SortableInputItem
                                            key={input.id}
                                            input={input}
                                            columnId={column.id}
                                            onUpdate={(id, updates) => onUpdateInput(column.id, id, updates)}
                                            onRemove={(id) => onRemoveInput(column.id, id)}
                                        />
                                    ))}
                                </SortableContext>
                                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onAddInput(column.id)}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Input
                                </Button>
                            </div>
                        </>
                    )}
                    {column.type === 'info' && (
                        <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded">
                            This column will display static text. Define the content for each row in the "Values & Sections" tab.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const DEFAULT_CONFIG: ChecklistConfig = {
    columns: [],
    sections: [{ id: 'default-section', title: 'General', order: 0 }],
    rows: []
};

export const ChecklistBuilder: React.FC<ChecklistBuilderProps> = ({ config = DEFAULT_CONFIG, onChange }) => {

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Helper to update specific parts of config
    const updateConfig = (updates: Partial<ChecklistConfig>) => {
        onChange({ ...config, ...updates });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            // Check if sorting Columns
            const oldColIndex = config.columns.findIndex(c => c.id === active.id);
            if (oldColIndex !== -1) {
                const newColIndex = config.columns.findIndex(c => c.id === over.id);
                updateConfig({
                    columns: arrayMove(config.columns, oldColIndex, newColIndex)
                });
                return;
            }

            // Check if sorting Inputs
            // Find the column that contains these inputs
            for (const col of config.columns) {
                const oldInputIndex = col.inputs.findIndex(i => i.id === active.id);
                const newInputIndex = col.inputs.findIndex(i => i.id === over.id);

                if (oldInputIndex !== -1 && newInputIndex !== -1) {
                    // Update this column's inputs
                    const newInputs = arrayMove(col.inputs, oldInputIndex, newInputIndex);
                    const newColumns = config.columns.map(c => c.id === col.id ? { ...c, inputs: newInputs } : c);
                    updateConfig({ columns: newColumns });
                    return;
                }
            }
        }
    };

    // --- Columns / Roles Management ---
    const addColumn = () => {
        const newColumn: ChecklistColumn = {
            id: `col-${Date.now()}`,
            name: 'New Column',
            type: 'input',
            inputs: [{ id: `inp-${Date.now()}`, type: 'checkbox', label: 'Verified' }],
            capabilities: { allowComments: true, allowAttachments: true }
        };
        updateConfig({ columns: [...config.columns, newColumn] });
    };

    const updateColumn = (colId: string, updates: Partial<ChecklistColumn>) => {
        updateConfig({
            columns: config.columns.map(c => c.id === colId ? { ...c, ...updates } : c)
        });
    };

    const removeColumn = (colId: string) => {
        updateConfig({ columns: config.columns.filter(c => c.id !== colId) });
    };

    const addInputToColumn = (colId: string) => {
        const newInput: ChecklistInput = { id: `inp-${Date.now()}`, type: 'text', label: 'Note' };
        const column = config.columns.find(c => c.id === colId);
        if (column) {
            updateColumn(colId, { inputs: [...column.inputs, newInput] });
        }
    };

    const updateColumnInput = (colId: string, inputId: string, updates: Partial<ChecklistInput>) => {
        const column = config.columns.find(c => c.id === colId);
        if (column) {
            const newInputs = column.inputs.map(i => i.id === inputId ? { ...i, ...updates } : i);
            updateColumn(colId, { inputs: newInputs });
        }
    };

    const removeColumnInput = (colId: string, inputId: string) => {
        const column = config.columns.find(c => c.id === colId);
        if (column) {
            updateColumn(colId, { inputs: column.inputs.filter(i => i.id !== inputId) });
        }
    };


    // --- Sections & Rows Management ---
    const addSection = () => {
        const newSection: ChecklistSection = {
            id: `sec-${Date.now()}`,
            title: 'New Section',
            order: config.sections.length
        };
        updateConfig({ sections: [...config.sections, newSection] });
    };

    const updateSection = (secId: string, title: string) => {
        updateConfig({
            sections: config.sections.map(s => s.id === secId ? { ...s, title } : s)
        });
    };

    const removeSection = (secId: string) => {
        // Also remove rows in this section
        updateConfig({
            sections: config.sections.filter(s => s.id !== secId),
            rows: config.rows.filter(r => r.sectionId !== secId)
        });
    };

    const addRow = (sectionId: string) => {
        const newRow: ChecklistRow = {
            id: `row-${Date.now()}`,
            sectionId,
            text: '',
            order: config.rows.filter(r => r.sectionId === sectionId).length
        };
        updateConfig({ rows: [...config.rows, newRow] });
    };

    const updateRow = (rowId: string, text: string) => {
        updateConfig({
            rows: config.rows.map(r => r.id === rowId ? { ...r, text } : r)
        });
    };

    const updateRowInfo = (rowId: string, colId: string, val: string) => {
        updateConfig({
            rows: config.rows.map(r =>
                r.id === rowId ? { ...r, info: { ...r.info, [colId]: val } } : r
            )
        });
    };

    const removeRow = (rowId: string) => {
        updateConfig({ rows: config.rows.filter(r => r.id !== rowId) });
    };


    return (
        <div className="space-y-6">
            <Tabs defaultValue="structure" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="structure">Values & Sections</TabsTrigger>
                    <TabsTrigger value="columns">Roles & Inputs</TabsTrigger>
                </TabsList>

                {/* --- SECTIONS & ROWS TAB --- */}
                <TabsContent value="structure" className="space-y-4 pt-4">
                    {config.sections.map((section) => (
                        <Card key={section.id} className="border-l-4 border-l-blue-500">
                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2 flex-grow">
                                    <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                    <Input
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, e.target.value)}
                                        className="font-semibold text-lg border-transparent hover:border-input focus:border-input transition-colors h-auto py-1 px-2"
                                    />
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0 px-4 pb-4">
                                <div className="space-y-2 ml-6 border-l pl-4">
                                    {config.rows.filter(r => r.sectionId === section.id).map(row => (
                                        <div key={row.id} className="space-y-2 p-2 rounded-md hover:bg-gray-100/50">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={row.text}
                                                    onChange={(e) => updateRow(row.id, e.target.value)}
                                                    placeholder="Checklist Item..."
                                                    className="flex-grow bg-white"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeRow(row.id)}>
                                                    <X className="h-4 w-4 text-gray-400" />
                                                </Button>
                                            </div>

                                            {/* Info Column Inputs */}
                                            {config.columns.filter(c => c.type === 'info').map(col => (
                                                <div key={col.id} className="flex items-center gap-2 ml-4">
                                                    <Label className="w-24 text-xs text-muted-foreground truncate">{col.name}:</Label>
                                                    <Input
                                                        value={row.info?.[col.id] || ''}
                                                        onChange={(e) => updateRowInfo(row.id, col.id, e.target.value)}
                                                        placeholder={`Enter ${col.name}...`}
                                                        className="h-8 text-xs bg-white"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={() => addRow(section.id)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" /> Add Item
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Button variant="outline" className="w-full border-dashed" onClick={addSection}>
                        <Plus className="h-4 w-4 mr-2" /> Add Section
                    </Button>
                </TabsContent>


                {/* --- COLUMNS & INPUTS TAB --- */}
                <TabsContent value="columns" className="space-y-4 pt-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SortableContext items={config.columns.map(c => c.id)} strategy={rectSortingStrategy}>
                                {config.columns.map(column => (
                                    <SortableColumnItem
                                        key={column.id}
                                        column={column}
                                        onUpdate={updateColumn}
                                        onRemove={removeColumn}
                                        onAddInput={addInputToColumn}
                                        onUpdateInput={updateColumnInput}
                                        onRemoveInput={removeColumnInput}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </DndContext>
                    <Button variant="outline" className="w-full border-dashed" onClick={addColumn}>
                        <Plus className="h-4 w-4 mr-2" /> Add Column
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    );
};
