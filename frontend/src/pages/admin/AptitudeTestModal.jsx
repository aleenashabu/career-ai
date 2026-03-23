import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const AptitudeTestModal = ({ isOpen, onClose, onSave, test, mode }) => {
    const backendUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: '',
        questions: [],
        status: 'Draft'
    });

    const [currentQuestion, setCurrentQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (test && mode === 'edit') {
            // normalize server object into form
            setFormData({
                title: test.title || '',
                description: test.description || '',
                category: test.category || '',
                difficulty: test.difficulty || '',
                questions: test.questions ? test.questions.map(q => ({ ...q })) : [],
                status: test.status || 'Draft'
            });
        } else {
            setFormData({ title: '', description: '', category: '', difficulty: '', questions: [], status: 'Draft' });
        }
        setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
        setEditingQuestionIndex(null);
        setErrors({});
    }, [test, mode, isOpen]);

    const categories = ['Numerical Ability', 'Verbal Ability', 'Logical Ability'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const answerOptions = ['A', 'B', 'C', 'D'];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.difficulty) newErrors.difficulty = 'Difficulty is required';
        if (!formData.questions.length) newErrors.questions = 'At least one question is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateQuestion = () => {
        const newErrors = {};
        if (!currentQuestion.question.trim()) newErrors.question = 'Question is required';
        if (currentQuestion.options.some(opt => !opt.trim())) newErrors.options = 'All options are required';
        if (!currentQuestion.correctAnswer) newErrors.correctAnswer = 'Correct answer is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddQuestion = () => {
        if (!validateQuestion()) return;
        if (editingQuestionIndex !== null) {
            const updated = [...formData.questions];
            updated[editingQuestionIndex] = { ...currentQuestion };
            setFormData(prev => ({ ...prev, questions: updated }));
            setEditingQuestionIndex(null);
        } else {
            setFormData(prev => ({ ...prev, questions: [...prev.questions, { ...currentQuestion }] }));
        }
        setCurrentQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
        setErrors({});
    };

    const handleEditQuestion = (index) => {
        setCurrentQuestion(formData.questions[index]);
        setEditingQuestionIndex(index);
    };

    const handleDeleteQuestion = (index) => {
        const updated = formData.questions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, questions: updated }));
    };

    // modal performs POST / PUT and then calls onSave(savedTest)
    const handleSave = async () => {
        if (!validateForm()) return;

        if (!token) {
            toast.error("Not authenticated");
            return;
        }

        // Build payload; include duration (1 minute per question) for immediate UI consistency
        const payload = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            difficulty: formData.difficulty,
            questions: formData.questions,
            status: formData.status,
            duration: formData.questions.length // minutes
        };

        try {
            if (mode === 'add') {
                const res = await fetch(`${backendUrl}/api/aptitude-tests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Failed to create test');
                toast.success("Aptitude test created");
                onSave(body.data);
            } else {
                // update
                const id = test._id ?? test.id;
                const res = await fetch(`${backendUrl}/api/aptitude-tests/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Failed to update test');
                toast.success("Aptitude test updated");
                onSave(body.data);
            }
        } catch (err) {
            console.error("handleSave:", err);
            toast.error(err.message || "Could not save test");
        }
    };

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = { hidden: { opacity: 0, scale: 0.8, y: 50 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }, exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } } };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden" onClick={onClose}>
                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-semibold text-foreground">{mode === 'edit' ? 'Edit Aptitude Test' : 'Add New Aptitude Test'}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 overflow-y-auto min-h-0">
                            <div className="space-y-6">
                                {/* Basic Test Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Test Title *</label>
                                        <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter test title" />
                                        {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                                        <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {errors.category && <p className="text-destructive text-sm mt-1">{errors.category}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]" placeholder="Enter test description"></textarea>
                                    {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
                                </div>

                                {/* Questions Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-foreground">Questions</h3>
                                        <span className="text-sm text-muted-foreground">{formData.questions.length} question(s) added</span>
                                    </div>

                                    {/* Add/Edit Question */}
                                    <div className="bg-muted/30 rounded-lg p-4 mb-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Question {editingQuestionIndex !== null ? `#${editingQuestionIndex + 1}` : `#${formData.questions.length + 1}`}
                                                </label>
                                                <input type="text" value={currentQuestion.question} onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter question text" />
                                                {errors.question && <p className="text-destructive text-sm mt-1">{errors.question}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentQuestion.options.map((option, idx) => (
                                                    <div key={idx}>
                                                        <label className="block text-sm font-medium text-foreground mb-2">Option {String.fromCharCode(65 + idx)}</label>
                                                        <input type="text" value={option} onChange={(e) => { const newOptions = [...currentQuestion.options]; newOptions[idx] = e.target.value; setCurrentQuestion(prev => ({ ...prev, options: newOptions })); }} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder={`Enter option ${String.fromCharCode(65 + idx)}`} />
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">Correct Answer</label>
                                                    <select value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                                        <option value="">Select Correct Answer</option>
                                                        {answerOptions.map(a => <option key={a} value={a}>{a}</option>)}
                                                    </select>
                                                    {errors.correctAnswer && <p className="text-destructive text-sm mt-1">{errors.correctAnswer}</p>}
                                                </div>
                                            </div>

                                            {errors.options && <p className="text-destructive text-sm">{errors.options}</p>}

                                            <button onClick={handleAddQuestion} className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"><Plus className="w-4 h-4" /><span>{editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}</span></button>
                                        </div>
                                    </div>

                                    {/* Questions List */}
                                    {formData.questions.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-foreground">Added Questions:</h4>
                                            {formData.questions.map((q, index) => (
                                                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-card border border-border rounded-lg p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h5 className="font-medium text-foreground mb-2">Question {index + 1}: {q.question}</h5>
                                                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                                                                {q.options.map((opt, optIndex) => (
                                                                    <div key={optIndex} className={`${q.correctAnswer === String.fromCharCode(65 + optIndex) ? 'text-green-600 font-medium' : ''}`}>{String.fromCharCode(65 + optIndex)}: {opt}</div>
                                                                ))}
                                                            </div>
                                                            <p className="text-sm text-green-600">Correct Answer: {q.correctAnswer}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2 ml-4">
                                                            <button onClick={() => handleEditQuestion(index)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteQuestion(index)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.questions && <p className="text-destructive text-sm mt-1">{errors.questions}</p>}
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Difficulty Level *</label>
                                    <select value={formData.difficulty} onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select Difficulty</option>
                                        {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    {errors.difficulty && <p className="text-destructive text-sm mt-1">{errors.difficulty}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 p-6 border-t border-border">
                            <button onClick={onClose} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Save Test</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AptitudeTestModal;
