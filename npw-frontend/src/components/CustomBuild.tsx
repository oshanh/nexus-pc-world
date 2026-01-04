
import React, { useState, useEffect } from 'react';
import { getPCBuildRecommendation } from '../services/geminiService';
import { CPU_MODELS, GPU_MODELS, COOLER_MODELS, CASE_MODELS, MOTHERBOARD_MODELS } from '../constants';
import type { BuildRecommendation, BuildPreferences } from '../types';
import GamingButton from './GamingButton';
import SearchableSelect from './SearchableSelect';

// Define types for jsPDF to avoid TypeScript errors with CDN-loaded libraries
declare global {
    interface Window {
        jspdf: any;
    }
}

const LoadingSpinner: React.FC = () => (
    <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
);

const RecommendationResult: React.FC<{ recommendation: BuildRecommendation }> = ({ recommendation }) => {
    const components = [
        { name: 'CPU', value: recommendation.cpu },
        { name: 'GPU', value: recommendation.gpu },
        { name: 'Motherboard', value: recommendation.motherboard },
        { name: 'RAM', value: recommendation.ram },
        { name: 'Storage', value: recommendation.storage },
        { name: 'Cooler', value: recommendation.cooler },
        { name: 'Power Supply', value: recommendation.psu },
        { name: 'Case', value: recommendation.case },
    ];

    const parsePrice = (price?: string | number): number => {
        if (price === undefined || price === null) return 0;
        if (typeof price === 'number') return Number.isFinite(price) ? price : 0;
        const parsed = Number.parseFloat(String(price).replace(/[^0-9.]/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const totalPrice = components.reduce((acc, comp) => acc + parsePrice(comp.value.price), 0);

    return (
        <div className="mt-8 bg-nexus-gray/50 p-6 rounded-lg border border-nexus-blue/30">
            <h4 className="text-2xl font-exo text-nexus-blue mb-4">AI Recommended Build:</h4>
            <p className="text-nexus-light mb-6">{recommendation.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map(comp => (
                    <div key={comp.name} className="bg-nexus-dark p-4 rounded">
                        <div className="flex justify-between items-start">
                            <p className="font-bold text-nexus-blue flex-grow pr-2">{comp.name}: <span className="text-white">{comp.value.name}</span></p>
                            <p className="font-mono text-nexus-light text-sm flex-shrink-0">{comp.value.price}</p>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{comp.value.reason}</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-nexus-blue/30 text-right">
                <p className="text-2xl font-exo font-bold text-white">
                    Total Estimated Price: <span className="text-nexus-blue">Rs {totalPrice.toLocaleString()}</span>
                </p>
            </div>
        </div>
    );
};

const OptionCard: React.FC<{ title: string; selected: boolean; onClick: () => void; children?: React.ReactNode }> = ({ title, selected, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center flex flex-col justify-center items-center h-full ${selected ? 'border-nexus-blue bg-nexus-blue/20 shadow-lg shadow-nexus-blue/30' : 'border-nexus-gray hover:border-nexus-blue/50 bg-nexus-gray/50'}`}
    >
        {children}
        <p className={`font-semibold mt-2 ${selected ? 'text-nexus-blue' : 'text-nexus-light'}`}>{title}</p>
    </button>
);

const steps = [
    { 
        name: "Use Case", 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 01-9-9 9 9 0 019-9m9 9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>
    },
    { 
        name: "Preferences", 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    { 
        name: "Generate", 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
    }
];

const CustomBuild: React.FC = () => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [useCase, setUseCase] = useState('Competitive Gaming');
    
    // Step 2 State
    const [budgetIndex, setBudgetIndex] = useState(2);
    const [cpuModel, setCpuModel] = useState(CPU_MODELS[3].name);
    const [gpuModel, setGpuModel] = useState(GPU_MODELS[0]);
    const [motherboardModel, setMotherboardModel] = useState('');
    const [ramCapacity, setRamCapacity] = useState('32GB');
    const [coolerModel, setCoolerModel] = useState(COOLER_MODELS[0]);
    const [caseModel, setCaseModel] = useState(CASE_MODELS[2]);
    
    const [availableMotherboards, setAvailableMotherboards] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<BuildRecommendation | null>(null);

    const budgetOptions = ['Rs 240,000 - Rs 360,000', 'Rs 360,000 - Rs 450,000', 'Rs 450,000 - Rs 600,000', 'Rs 600,000 - Rs 900,000', 'Rs 900,000+'];
    
    useEffect(() => {
        if (!cpuModel) {
            setAvailableMotherboards([]);
            setMotherboardModel('');
            return;
        }

        const selectedCpuObject = CPU_MODELS.find(cpu => cpu.name === cpuModel);
        if (selectedCpuObject) {
            const compatibleBoards = MOTHERBOARD_MODELS
                .filter(board => board.socket === selectedCpuObject.socket)
                .map(board => board.name);
            
            setAvailableMotherboards(compatibleBoards);

            if (!compatibleBoards.includes(motherboardModel)) {
                setMotherboardModel('');
            }
        }
    }, [cpuModel]);

    const generatePdf = (recommendation: BuildRecommendation) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const parsePrice = (price?: string | number): number => {
            if (price === undefined || price === null) return 0;
            if (typeof price === 'number') return Number.isFinite(price) ? price : 0;
            const parsed = Number.parseFloat(String(price).replace(/[^0-9.]/g, ''));
            return Number.isFinite(parsed) ? parsed : 0;
        };

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(185, 28, 28); // Darker red for title
        doc.text("NEXUS PC World - Custom Build Summary", 14, 20);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        const summaryLines = doc.splitTextToSize(recommendation.summary, 180);
        doc.text(summaryLines, 14, 30);

        const components = [
            { tier: 'Core', name: 'CPU', value: recommendation.cpu },
            { tier: 'Core', name: 'GPU', value: recommendation.gpu },
            { tier: 'Core', name: 'Motherboard', value: recommendation.motherboard },
            { tier: 'Core', name: 'RAM', value: recommendation.ram },
            { tier: 'Supporting', name: 'Storage', value: recommendation.storage },
            { tier: 'Supporting', name: 'Cooler', value: recommendation.cooler },
            { tier: 'Supporting', name: 'Power Supply', value: recommendation.psu },
            { tier: 'Supporting', name: 'Case', value: recommendation.case },
        ];
        
        const tableBody = components.map(c => [c.name, c.value.name, c.value.reason, c.value.price || 'N/A']);
        const totalPrice = components.reduce((acc, comp) => acc + parsePrice(comp.value.price), 0);

        (doc as any).autoTable({
            startY: 50,
            head: [['Component', 'Selection', 'Reasoning', 'Est. Price']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [26, 26, 46] }, // nexus-gray
            styles: { font: 'helvetica', fontSize: 9 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                2: { cellWidth: 70 },
                3: { halign: 'right' }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text("Total Estimated Price:", 145, finalY + 15, { align: 'right' });
        doc.setTextColor(239, 68, 68); // nexus-blue (Red)
        doc.text(`Rs ${totalPrice.toLocaleString()}`, 200, finalY + 15, { align: 'right' });

        doc.save('nexus-pc-build-summary.pdf');
    };

    const handleSubmit = async () => {
        if (!motherboardModel) {
            setError("Please select a motherboard before generating the build.");
            return;
        }
        setLoading(true);
        setError(null);
        setRecommendation(null);
        try {
            const preferences: BuildPreferences = {
                cpuModel,
                gpuModel,
                motherboardModel,
                ramCapacity,
                coolerModel,
                caseModel,
            };
            const result = await getPCBuildRecommendation(useCase, budgetOptions[budgetIndex], preferences);
            setRecommendation(result);
            generatePdf(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <Step1 useCase={useCase} setUseCase={setUseCase} />;
            case 2:
                return <Step2 
                    budgetIndex={budgetIndex} setBudgetIndex={setBudgetIndex} budgetOptions={budgetOptions}
                    cpuModel={cpuModel} setCpuModel={setCpuModel}
                    gpuModel={gpuModel} setGpuModel={setGpuModel}
                    motherboardModel={motherboardModel} setMotherboardModel={setMotherboardModel}
                    availableMotherboards={availableMotherboards}
                    ramCapacity={ramCapacity} setRamCapacity={setRamCapacity}
                    coolerModel={coolerModel} setCoolerModel={setCoolerModel}
                    caseModel={caseModel} setCaseModel={setCaseModel}
                />;
            case 3:
                return <Step3 
                    useCase={useCase} 
                    budget={budgetOptions[budgetIndex]} 
                    preferences={{ cpuModel, gpuModel, motherboardModel, ramCapacity, coolerModel, caseModel }}
                    onSubmit={handleSubmit}
                    loading={loading}
                />;
            default:
                return null;
        }
    }

    return (
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="text-center">
                    <h2 className="text-4xl font-exo font-bold mb-2">Build Your Dream Rig</h2>
                    <p className="text-nexus-light mb-12 max-w-3xl mx-auto">
                        Don't know where to start? Let our AI expert recommend a build tailored just for you.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-nexus-dark p-4 sm:p-8 rounded-lg shadow-2xl border border-nexus-purple/30 animate-glow">
                     {/* Stepper */}
                    <div className="flex items-start mb-16">
                        {steps.map((s, i) => {
                            const stepNumber = i + 1;
                            const isCompleted = step > stepNumber;
                            const isActive = step === stepNumber;

                            return (
                                <React.Fragment key={s.name}>
                                    <div
                                        className="flex flex-col items-center text-center"
                                        aria-current={isActive ? 'step' : undefined}
                                    >
                                        <button
                                            onClick={() => isCompleted && setStep(stepNumber)}
                                            className={`
                                                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative focus:outline-none 
                                                ${isCompleted ? 'bg-nexus-blue text-white cursor-pointer hover:scale-110' : ''}
                                                ${isActive ? 'bg-nexus-dark border-2 border-nexus-blue text-nexus-blue shadow-[0_0_15px_rgba(239,68,68,0.8)]' : ''}
                                                ${!isCompleted && !isActive ? 'bg-nexus-gray text-gray-500 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {isCompleted ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                s.icon
                                            )}
                                        </button>
                                        <p className={`mt-3 text-xs sm:text-sm font-semibold transition-colors
                                            ${isActive ? 'text-nexus-blue' : isCompleted ? 'text-nexus-light' : 'text-gray-500'}
                                        `}>
                                            {s.name}
                                        </p>
                                    </div>
                                    
                                    {i < steps.length - 1 && (
                                        <div className={`flex-grow h-1 mt-6 mx-2 sm:mx-4 transition-colors duration-500 rounded-full
                                            ${isCompleted ? 'bg-nexus-blue' : 'bg-nexus-gray'}
                                        `}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center min-h-[300px]">
                            <div className="text-center">
                                <div className="inline-block"><LoadingSpinner /></div>
                                <p className="mt-4 text-nexus-blue animate-pulse">Our AI expert is crafting your build...</p>
                                <p className="text-sm text-gray-400">This may take a moment.</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <h3 className="mt-4 text-2xl font-exo font-bold text-red-400">Generation Failed</h3>
                            <p className="mt-2 text-nexus-light bg-red-900/50 p-4 rounded-lg">{error}</p>
                            <GamingButton onClick={() => setError(null)} variant="secondary" className="mt-6">
                                Back to Configuration
                            </GamingButton>
                        </div>
                    ) : (
                        renderStepContent()
                    )}


                    {/* Navigation */}
                    {!loading && !error && step < 3 && (
                         <div className="flex justify-between mt-8">
                            <GamingButton onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} variant="secondary">
                                Back
                            </GamingButton>
                            <GamingButton onClick={() => setStep(s => Math.min(3, s + 1))} variant="primary">
                                Next
                            </GamingButton>
                        </div>
                    )}
                    
                    {!loading && !error && recommendation && <RecommendationResult recommendation={recommendation} />}
                </div>
            </div>
        </section>
    );
};


const Step1: React.FC<{ useCase: string, setUseCase: (uc: string) => void }> = ({ useCase, setUseCase }) => {
    const useCases = [
        { name: 'Competitive Gaming', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
        { name: '4K Gaming', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg> },
        { name: 'Streaming & Content Creation', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> },
        { name: 'Video Editing Workstation', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
        { name: 'Budget Gaming', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    ];
    return (
        <div>
            <h3 className="text-xl font-bold text-nexus-blue mb-4 text-center">What is your primary use case?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {useCases.map(uc => (
                    <OptionCard key={uc.name} title={uc.name} selected={useCase === uc.name} onClick={() => setUseCase(uc.name)}>
                        {uc.icon}
                    </OptionCard>
                ))}
            </div>
        </div>
    )
};

const Step2: React.FC<any> = ({ budgetIndex, setBudgetIndex, budgetOptions, cpuModel, setCpuModel, gpuModel, setGpuModel, motherboardModel, setMotherboardModel, availableMotherboards, ramCapacity, setRamCapacity, coolerModel, setCoolerModel, caseModel, setCaseModel }) => {
    return (
        <div>
             <h3 className="text-xl font-bold text-nexus-blue mb-6 text-center">Select Your Core Components</h3>
            {/* Budget */}
            <div className="mb-8">
                <label htmlFor="budget" className="block text-nexus-light font-bold mb-2">Budget: <span className="text-nexus-blue font-exo text-lg">{budgetOptions[budgetIndex]}</span></label>
                <input id="budget" type="range" min="0" max={budgetOptions.length - 1} value={budgetIndex} onChange={(e) => setBudgetIndex(parseInt(e.target.value, 10))} className="w-full h-2 bg-nexus-gray rounded-lg appearance-none cursor-pointer" />
            </div>

            <SearchableSelect label="Processor (CPU)" value={cpuModel} onChange={setCpuModel} options={CPU_MODELS.map(c => c.name)} />
            <SearchableSelect 
                label="Motherboard" 
                value={motherboardModel} 
                onChange={setMotherboardModel} 
                options={availableMotherboards}
                disabled={!cpuModel}
            />
            <SearchableSelect label="Graphics Card (GPU)" value={gpuModel} onChange={setGpuModel} options={GPU_MODELS} />
            
            <div className="mb-8">
                <p className="text-nexus-light font-bold mb-3">RAM Capacity</p>
                <div className="grid grid-cols-3 gap-4">
                    {['16GB', '32GB', '64GB'].map(opt => <OptionCard key={opt} title={opt} selected={ramCapacity === opt} onClick={() => setRamCapacity(opt)} />)}
                </div>
            </div>

            <SearchableSelect label="CPU Cooler" value={coolerModel} onChange={setCoolerModel} options={COOLER_MODELS} />
            <SearchableSelect label="PC Case" value={caseModel} onChange={setCaseModel} options={CASE_MODELS} />
        </div>
    )
};

const Step3: React.FC<{ useCase: string; budget: string; preferences: BuildPreferences; onSubmit: () => void; loading: boolean }> = ({ useCase, budget, preferences, onSubmit, loading }) => {
    return (
        <div>
             <h3 className="text-xl font-bold text-nexus-blue mb-6 text-center">Review Your Choices</h3>
             <div className="bg-nexus-gray/50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between"><span className="font-semibold text-gray-400">Use Case:</span> <span className="text-white font-medium">{useCase}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">Budget:</span> <span className="text-white font-medium">{budget}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">CPU:</span> <span className="text-white font-medium">{preferences.cpuModel}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">GPU:</span> <span className="text-white font-medium">{preferences.gpuModel}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">Motherboard:</span> <span className="text-white font-medium">{preferences.motherboardModel || 'Not Selected'}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">RAM:</span> <span className="text-white font-medium">{preferences.ramCapacity}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">Cooler:</span> <span className="text-white font-medium">{preferences.coolerModel}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-gray-400">Case:</span> <span className="text-white font-medium">{preferences.caseModel}</span></div>
             </div>
             <div className="text-center mt-8">
                <GamingButton onClick={onSubmit} disabled={loading} variant="cta">
                    {loading ? <LoadingSpinner /> : 'Generate My Build'}
                </GamingButton>
            </div>
        </div>
    );
};

export default CustomBuild;
