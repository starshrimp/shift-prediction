import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const InfoAccordions = () => (
    <>

        <Accordion sx={{ my: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1"><strong>What is “Shift” and why Does It Matter?</strong></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body2">
                    “Shift” refers to how far the patient’s oxyhaemoglobin dissociation curve (ODC) is displaced from the reference curve.
                    A rightward shift typically indicates impaired oxygen uptake.
                    <br /><br />
                    This tool uses your SpO₂–PiO₂ measurements to estimate that shift. A higher shift value often corresponds to more severe gas exchange impairment.
                    <br /><br />
                    The model also returns an uncertainty estimate (± SD). Lower SD values mean higher confidence in the prediction.
                    </Typography>
                </AccordionDetails>
                </Accordion>

                <Accordion sx={{ my: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1"><strong>Model Limitations</strong></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body2">
                    This tool uses a machine learning model trained on paired SpO₂–PiO₂ data from preterm infants to estimate the shift in the oxyhaemoglobin dissociation curve (ODC). While designed for bedside use, the following limitations should be kept in mind:
                    <ul>
                        <li>The model was developed from data on <strong>219 preterm infants</strong>. Performance outside this group (e.g. term infants, adults) is unknown.</li>
                        <li>Predictions are most accurate with <strong>SpO₂ values below ca. 92%  and 95%</strong>. Points above 95% contribute less information and may reduce model accuracy.</li>
                        <li>In <strong>very severely impaired infants</strong> (e.g. high shunt, extreme right shift), the model may <strong>overestimate the shift</strong>, particularly when using only 1–2 datapoints.</li>
                        <li>Reliable input is essential. Ensure that SpO₂ and PiO₂ values are stable and artifact-free before entering.</li>
                        <li>The tool assumes normal haemoglobin–oxygen binding. Hemoglobinopathies or altered Hb levels may affect accuracy.</li>
                        <li>Shift prediction is intended as a <strong>decision support tool</strong>, not a diagnostic output.</li>
                        <li>An uncertainty value (± SD) is provided with each result to reflect confidence in the prediction.</li>
                    </ul>
                    </Typography>
                </AccordionDetails>
                </Accordion>
                <Accordion sx={{ my: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1"><strong>Data Privacy</strong></Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="body2">
                    Your data is <strong>not stored, logged, or transmitted</strong> beyond the scope of the current prediction session.
                    <ul>
                        <li>All data entered is processed <strong>in memory only</strong> and discarded after the result is returned.</li>
                        <li>No data is saved on the server, in cookies, or in browser storage.</li>
                        <li>No patient-identifiable information is used or required.</li>
                        <li>This tool is intended for temporary, local use — suitable for bedside or teaching purposes.</li>
                    </ul>
                    </Typography>
                </AccordionDetails>
            </Accordion>
    </>
);

export default InfoAccordions;